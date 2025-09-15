const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
// You should provide the path to your service account key JSON in .env as GOOGLE_APPLICATION_CREDENTIALS
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  admin.initializeApp({
    credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
  });
  // Ignore undefined properties to avoid Firestore errors on optional fields
  admin.firestore().settings({ ignoreUndefinedProperties: true });
  console.log('Firebase Admin initialized');
} else {
  console.warn('GOOGLE_APPLICATION_CREDENTIALS not set. Firebase Admin not initialized.');
}

app.get('/', (req, res) => {
  res.send('Career Development Webapp Backend');
});

// Save onboarding profile to Firestore
app.post('/api/profile', async (req, res) => {
  const { uid, skills, goals, preference, mode, resumeUrl, linkedin } = req.body;
  if (!uid || !skills || !goals || !preference || !mode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await admin.firestore().collection('users').doc(uid).set({
      profile: {
        skills,
        goals,
        preference,
        mode,
        resumeUrl: resumeUrl || '',
        linkedin: linkedin || '',
        updatedAt: new Date().toISOString(),
      }
    }, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: Parse resume file (PDF or DOCX)
async function parseResume(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } else if (ext === '.docx') {
    const data = await mammoth.extractRawText({ path: filePath });
    return data.value;
  }
  throw new Error('Unsupported file type');
}

// Helper: Extract skills from resume text (very basic, for demo)
function extractSkillsFromText(text) {
  const skillsList = ['python', 'sql', 'javascript', 'react', 'node', 'java', 'c++', 'data analysis', 'machine learning', 'excel', 'communication', 'leadership'];
  const found = skillsList.filter(skill => text.toLowerCase().includes(skill));
  return found;
}

// Onboarding endpoint (with resume parsing)
app.post('/api/onboarding', async (req, res) => {
  try {
    const { uid, name, email, skills, goals, preference, mode, resumeUrl, linkedin } = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'uid is required' });
    }
    let parsedSkills = [];
    if (resumeUrl) {
      // Download and parse resume (assume public URL or local path for demo)
      const resumePath = path.join(__dirname, 'tmp', `${uid}_resume` + path.extname(resumeUrl));
      const writer = fs.createWriteStream(resumePath);
      const response = await axios({ url: resumeUrl, method: 'GET', responseType: 'stream' });
      response.data.pipe(writer);
      await new Promise((resolve, reject) => { writer.on('finish', resolve); writer.on('error', reject); });
      const resumeText = await parseResume(resumePath);
      parsedSkills = extractSkillsFromText(resumeText);
      fs.unlinkSync(resumePath);
    }
    const allSkills = Array.from(new Set([...(skills || []), ...parsedSkills]));

    // Build profile object without undefined values
    const profile = {
      updatedAt: new Date().toISOString(),
    };
    if (Array.isArray(allSkills) && allSkills.length) profile.skills = allSkills;
    if (typeof goals === 'string' && goals) profile.goals = goals;
    if (typeof preference === 'string' && preference) profile.preference = preference;
    if (typeof mode === 'string' && mode) profile.mode = mode;
    if (typeof resumeUrl === 'string') profile.resumeUrl = resumeUrl || '';
    if (typeof linkedin === 'string') profile.linkedin = linkedin || '';
    if (typeof name === 'string' && name) profile.name = name;
    if (typeof email === 'string' && email) profile.email = email;

    await admin.firestore().collection('users').doc(uid).set({ profile }, { merge: true });

    res.json({ success: true, parsedSkills: parsedSkills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const AXIOS_TIMEOUT_MS = 20000;

// Gemini skill gap analysis and roadmap generation
app.post('/api/generate-roadmap', async (req, res) => {
  const { uid } = req.body;
  console.log(`[generate-roadmap] start uid=${uid}`);
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      console.warn(`[generate-roadmap] user not found uid=${uid}`);
      return res.status(404).json({ error: 'User not found' });
    }
    const profile = userDoc.data().profile || {};
    const userSkills = Array.isArray(profile.skills) ? profile.skills : [];
    const targetGoal = typeof profile.goals === 'string' ? profile.goals : '';
    const pref = typeof profile.preference === 'string' ? profile.preference : '';

    console.log(`[generate-roadmap] profile data: skills=${userSkills.length}, goal="${targetGoal}", pref="${pref}"`);

    if (!process.env.GEMINI_API_KEY) {
      console.error('[generate-roadmap] GEMINI_API_KEY not set');
      // Fallback roadmap without calling Gemini
      const fallback = [{ week: 1, topics: userSkills.slice(0, 5), projects: [] }];
      await admin.firestore().collection('users').doc(uid).set({ roadmap: fallback, skillAnalysis: '' }, { merge: true });
      return res.json({ skillAnalysis: '', roadmap: fallback });
    }

    let skillAnalysis = '';
    try {
      console.log(`[generate-roadmap] calling Gemini for skill analysis...`);
      const geminiSkillRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: `Analyze these skills: ${userSkills.join(', ')}. Target role: ${targetGoal}. Preferences: ${pref}. What skills are missing? Suggest a learning order.` }] }] },
        { timeout: AXIOS_TIMEOUT_MS }
      );
      console.log(`[generate-roadmap] Gemini skill analysis response status: ${geminiSkillRes.status}`);
      skillAnalysis = geminiSkillRes?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (e) {
      console.warn('[generate-roadmap] skill analysis failed, using empty analysis:', e.message);
      skillAnalysis = '';
    }

    let rawRoadmap = '';
    try {
      console.log(`[generate-roadmap] calling Gemini for roadmap generation...`);
      const geminiRoadmapRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: `Based on this analysis: ${skillAnalysis}, generate a 6-week roadmap with weekly goals, topics, and mini-projects for ${targetGoal}. Respond strictly as pure JSON array (no prose, no backticks): [{"week":1,"topics":["..."],"projects":["..."]}]` }] }] },
        { timeout: AXIOS_TIMEOUT_MS }
      );
      console.log(`[generate-roadmap] Gemini roadmap response status: ${geminiRoadmapRes.status}`);
      rawRoadmap = geminiRoadmapRes?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (e) {
      console.warn('[generate-roadmap] roadmap generation failed, will use fallback:', e.message);
      rawRoadmap = '';
    }

    function tryParseJson(text) {
      try { return JSON.parse(text); } catch (_) {}
      const startArr = text.indexOf('[');
      const endArr = text.lastIndexOf(']');
      if (startArr !== -1 && endArr !== -1 && endArr > startArr) {
        try { return JSON.parse(text.slice(startArr, endArr + 1)); } catch (_) {}
      }
      const startObj = text.indexOf('{');
      const endObj = text.lastIndexOf('}');
      if (startObj !== -1 && endObj !== -1 && endObj > startObj) {
        try { return [JSON.parse(text.slice(startObj, endObj + 1))]; } catch (_) {}
      }
      return null;
    }

    let parsed = tryParseJson(rawRoadmap);
    if (!Array.isArray(parsed)) {
      parsed = Array.from({ length: 6 }).map((_, i) => ({ week: i + 1, topics: userSkills.slice(0, Math.min(5, userSkills.length)), projects: [] }));
      console.warn(`[generate-roadmap] fallback roadmap used uid=${uid}`);
    }
    const normalized = parsed.map((w, idx) => ({
      week: typeof w.week === 'number' ? w.week : (idx + 1),
      topics: Array.isArray(w.topics) ? w.topics : [],
      projects: Array.isArray(w.projects) ? w.projects : [],
    }));

    await admin.firestore().collection('users').doc(uid).set({ roadmap: normalized, skillAnalysis }, { merge: true });
    console.log(`[generate-roadmap] success uid=${uid} weeks=${normalized.length}`);
    res.json({ skillAnalysis, roadmap: normalized });
  } catch (err) {
    console.error('[generate-roadmap] Error:', err.message);
    console.error('[generate-roadmap] Error details:', err.response?.data || err.stack);
    res.status(500).json({ error: err.message });
  }
});

// YouTube, Coursera, GitHub resource aggregation
app.get('/api/resources/:uid', async (req, res) => {
  const { uid } = req.params;
  console.log(`[resources] start uid=${uid}`);
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      console.warn(`[resources] user not found uid=${uid}`);
      return res.status(404).json({ error: 'User not found' });
    }
    let roadmap = userDoc.data().roadmap;
    if (typeof roadmap === 'string') {
      try { roadmap = JSON.parse(roadmap); } catch (_) { roadmap = []; }
    }

    const resources = {};
    const weeks = Array.isArray(roadmap) ? roadmap : [];
    if (!weeks.length) {
      console.log(`[resources] No weeks for uid=${uid}. Returning empty resources.`);
      await admin.firestore().collection('users').doc(uid).set({ resources }, { merge: true });
      return res.json({ resources });
    }

    for (const week of weeks) {
      for (const topic of (week?.topics) || []) {
        let ytVideos = [];
        try {
          const ytRes = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=Best tutorial ${encodeURIComponent(topic)}&key=${process.env.YOUTUBE_API_KEY}&maxResults=3&type=video`);
          ytVideos = (ytRes.data.items || []).map(item => ({
            title: item.snippet.title,
            videoId: item.id.videoId,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnail: item.snippet.thumbnails?.default?.url || ''
          }));
        } catch (e) {
          console.warn(`[resources] YouTube fetch failed for topic="${topic}": ${e.message}`);
        }
        const courses = [{ name: `Course on ${topic}`, url: '#', difficulty: 'Beginner', rating: 4.5 }];
        const github = [{ name: `Open source ${topic}`, url: 'https://github.com/', label: 'good-first-issue' }];
        resources[topic] = { ytVideos, courses, github };
      }
    }
    await admin.firestore().collection('users').doc(uid).set({ resources }, { merge: true });
    console.log(`[resources] success uid=${uid} topics=${Object.keys(resources).length}`);
    res.json({ resources });
  } catch (err) {
    console.error('[resources] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Tech news endpoint (stub)
app.get('/api/news', async (req, res) => {
  try {
    // For demo, return static news
    const news = [
      { title: 'AI beats humans at coding', summary: 'Gemini 2.5 Flash sets new record.', url: 'https://news.com/ai-coding' },
      { title: 'React 19 Released', summary: 'Major improvements in performance and DX.', url: 'https://news.com/react19' }
    ];
    res.json({ news });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Progress tracking and notifications (stub)
app.post('/api/progress', async (req, res) => {
  // Accepts: { uid, week, topic, type: 'video'|'quiz'|'project', completed: true }
  try {
    const { uid, week, topic, type } = req.body;
    // Update progress in Firestore (stub)
    await admin.firestore().collection('users').doc(uid).set({ progress: { [week]: { [topic]: { [type]: true } } } }, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
