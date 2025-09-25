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
    const { uid, name, email, skills, goals, preference, mode, resumeUrl, linkedin, education, role, targetRole } = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'uid is required' });
    }
    // Load existing profile to preserve history
    let existingProfile = {};
    try {
      const existingDoc = await admin.firestore().collection('users').doc(uid).get();
      if (existingDoc.exists) existingProfile = existingDoc.data()?.profile || {};
    } catch (_) {}

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
    if (typeof education === 'string' && education) profile.education = education;
    if (typeof role === 'string' && role) profile.role = role;
    if (typeof targetRole === 'string' && targetRole) profile.targetRole = targetRole;

    // Preserve historical skills and record current onboarding submission
    if (Array.isArray(existingProfile.skills) && existingProfile.skills.length) {
      profile.pastSkills = existingProfile.skills;
    }
    profile.onboarding = {
      lastSubmittedAt: new Date().toISOString(),
      goals: typeof goals === 'string' ? goals : existingProfile.goals || '',
      preference: typeof preference === 'string' ? preference : existingProfile.preference || '',
      mode: typeof mode === 'string' ? mode : existingProfile.mode || ''
    };

    await admin.firestore().collection('users').doc(uid).set({ profile }, { merge: true });

    res.json({ success: true, parsedSkills: parsedSkills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const AXIOS_TIMEOUT_MS = parseInt(process.env.GEMINI_TIMEOUT_MS || '45000', 10);

// Robust Gemini caller with retries and backoff
async function callGeminiGenerate(promptText, { retries = 2, timeout = AXIOS_TIMEOUT_MS, model = 'gemini-2.5-flash' } = {}) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: promptText }] }] },
        { timeout }
      );
      return res?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (e) {
      lastErr = e;
      if (attempt === retries) break;
      const waitMs = 800 * Math.pow(2, attempt);
      console.warn(`[gemini] attempt ${attempt + 1} failed: ${e.message}; retrying in ${waitMs}ms`);
      await new Promise(r => setTimeout(r, waitMs));
    }
  }
  throw lastErr;
}

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
    const historicalSkills = Array.isArray(profile.pastSkills) ? profile.pastSkills : [];
    const targetGoal = typeof profile.goals === 'string' ? profile.goals : '';
    const pref = typeof profile.preference === 'string' ? profile.preference : '';
    const mode = typeof profile.mode === 'string' ? profile.mode : '';
    const name = typeof profile.name === 'string' ? profile.name : '';
    const email = typeof profile.email === 'string' ? profile.email : '';
    const education = typeof profile.education === 'string' ? profile.education : '';
    const role = typeof profile.role === 'string' ? profile.role : '';
    const targetRole = typeof profile.targetRole === 'string' ? profile.targetRole : '';
    const onboardingMeta = typeof profile.onboarding === 'object' && profile.onboarding ? profile.onboarding : {};

    console.log(`[generate-roadmap] profile data: skills=${userSkills.length}, goal="${targetGoal}", pref="${pref}", mode="${mode}", edu="${education}", role="${role}", targetRole="${targetRole}"`);

    if (!process.env.GEMINI_API_KEY) {
      console.error('[generate-roadmap] GEMINI_API_KEY not set');
      // Fallback roadmap without calling Gemini
      const fallback = [{ week: 1, topics: userSkills.slice(0, 5), projects: [] }];
      await admin.firestore().collection('users').doc(uid).set({ roadmap: fallback, skillAnalysis: '' }, { merge: true });
      return res.json({ skillAnalysis: '', roadmap: fallback });
    }

    // Single comprehensive request to Gemini
    let aiPlanRaw = '';
    try {
      console.log(`[generate-roadmap] calling Gemini for comprehensive plan...`);
      const context = {
        name,
        email,
        education,
        role,
        targetRole,
        goals: targetGoal,
        skills: userSkills,
        historicalSkills,
        learningPreference: pref,
        learningMode: mode,
        onboarding: onboardingMeta
      };
      const prompt = `You are a senior career mentor. Combine historical background with current onboarding intent to produce a pragmatic transition plan.\n\nUSER CONTEXT JSON: ${JSON.stringify(context)}\n\nReturn STRICT JSON ONLY (no prose, no code fences) with this exact shape:\n{\n  "analysis": {\n    "skillGaps": ["..."],\n    "level": "beginner|intermediate|advanced",\n    "summary": "Summarize current vs target and transition focus"\n  },\n  "tips": ["Actionable tips to move from historicalSkills to goals/targetRole"],\n  "roadmap": [\n    { "week": 1, "weeklyGoal": "...", "topics": ["..."], "projects": ["..."], "assessment": "quiz|mini-project|reflection" }\n  ],\n  "resources": {\n    "recommendedSearchKeywords": ["..."],\n    "books": [{"title":"...","author":"..."}],\n    "courses": [{"title":"...","platform":"...","url":"..."}],\n    "videos": [{"title":"...","url":"..."}]\n  }\n}`;
      aiPlanRaw = await callGeminiGenerate(prompt, { retries: 2, timeout: AXIOS_TIMEOUT_MS, model: 'gemini-2.5-flash' });
      console.log(`[generate-roadmap] Gemini comprehensive response received (${aiPlanRaw.length} chars)`);
    } catch (e) {
      console.warn('[generate-roadmap] comprehensive plan generation failed:', e.message);
      aiPlanRaw = '';
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

    // Parse AI plan
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
        try { return JSON.parse(text.slice(startObj, endObj + 1)); } catch (_) {}
      }
      return null;
    }

    let aiPlan = aiPlanRaw ? tryParseJson(aiPlanRaw) : null;
    if (Array.isArray(aiPlan)) {
      aiPlan = { analysis: { skillGaps: [], level: '', summary: '' }, tips: [], roadmap: aiPlan, resources: { recommendedSearchKeywords: [], books: [], courses: [], videos: [] } };
    }
    if (!aiPlan || typeof aiPlan !== 'object') {
      const fallbackRoadmap = Array.from({ length: 6 }).map((_, i) => ({ week: i + 1, weeklyGoal: `Foundations Week ${i + 1}`, topics: userSkills.slice(0, Math.min(5, userSkills.length)), projects: [] }));
      aiPlan = {
        analysis: { skillGaps: [], level: '', summary: '' },
        tips: [
          'Set 45–60 minute focused study blocks daily',
          'Alternate theory and practice; ship a tiny project each week'
        ],
        roadmap: fallbackRoadmap,
        resources: { recommendedSearchKeywords: userSkills.map(s => `best ${s} course`), books: [], courses: [], videos: [] }
      };
      console.warn(`[generate-roadmap] fallback AI plan used uid=${uid}`);
    }

    const normalized = (Array.isArray(aiPlan.roadmap) ? aiPlan.roadmap : []).map((w, idx) => ({
      week: typeof w.week === 'number' ? w.week : (idx + 1),
      topics: Array.isArray(w.topics) ? w.topics : [],
      projects: Array.isArray(w.projects) ? w.projects : [],
      weeklyGoal: typeof w.weeklyGoal === 'string' ? w.weeklyGoal : ''
    }));

    await admin.firestore().collection('users').doc(uid).set({
      aiPlan: {
        analysis: aiPlan.analysis || {},
        tips: Array.isArray(aiPlan.tips) ? aiPlan.tips : [],
        resources: aiPlan.resources || {}
      },
      roadmap: normalized,
      skillAnalysis: aiPlan.analysis?.summary || ''
    }, { merge: true });
    console.log(`[generate-roadmap] success uid=${uid} weeks=${normalized.length}`);
    res.json({ analysis: aiPlan.analysis || {}, tips: Array.isArray(aiPlan.tips) ? aiPlan.tips : [], roadmap: normalized, resources: aiPlan.resources || {} });
  } catch (err) {
    console.error('[generate-roadmap] Error:', err.message);
    console.error('[generate-roadmap] Error details:', err.response?.data || err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Lightweight roadmap generation from raw inputs (name, skills, goals) + YouTube videos
app.post('/api/roadmap', async (req, res) => {
  try {
    const { uid = '', name = '', skills = '', goals = '' } = req.body || {};

    // 1) Call Gemini for a 6-week structured roadmap (prefer strict JSON)
    let weeks = [];
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `User details:\nName: ${name}\nSkills: ${skills}\nGoals: ${goals}\n\nReturn STRICT JSON ONLY (no prose, no fences) as an array of 6 weeks in this exact shape: [ { "week": 1, "weeklyGoal": "...", "topics": ["..."], "projects": ["..."] }, ... ]`;
        const text = await callGeminiGenerate(prompt, { retries: 2, timeout: AXIOS_TIMEOUT_MS, model: 'gemini-2.5-flash' });
        try {
          const start = text.indexOf('[');
          const end = text.lastIndexOf(']');
          const slice = start !== -1 && end !== -1 && end > start ? text.slice(start, end + 1) : text;
          const parsed = JSON.parse(slice);
          if (Array.isArray(parsed)) weeks = parsed.map((w, i) => ({
            week: typeof w.week === 'number' ? w.week : i + 1,
            weeklyGoal: typeof w.weeklyGoal === 'string' ? w.weeklyGoal : '',
            topics: Array.isArray(w.topics) ? w.topics : [],
            projects: Array.isArray(w.projects) ? w.projects : []
          }));
        } catch (_) {}
      } catch (e) {
        console.warn('[api/roadmap] Gemini call failed:', e.message);
      }
    }

    // Fallback simple 6-week scaffold if Gemini unavailable or parsing failed
    if (!weeks.length) {
      const topicsSeed = typeof skills === 'string' && skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];
      weeks = Array.from({ length: 6 }, (_, i) => ({
        week: i + 1,
        weeklyGoal: `Focus Week ${i + 1}`,
        topics: topicsSeed.slice(0, Math.min(3, topicsSeed.length)),
        projects: [`Mini project for week ${i + 1}`]
      }));
    }

    // 2) YouTube videos for first skill + goal
    const youtubeKey = process.env.YOUTUBE_API_KEY;
    let videos = [];
    if (youtubeKey) {
      try {
        const firstSkill = (typeof skills === 'string' ? skills : '').split(',')[0] || '';
        const q = `${firstSkill} ${goals}`.trim() || 'learning roadmap';
        const yt = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: { q, part: 'snippet', maxResults: 5, type: 'video', key: youtubeKey },
          timeout: AXIOS_TIMEOUT_MS
        });
        videos = (yt.data.items || []).map(item => ({
          title: item.snippet?.title,
          description: item.snippet?.description,
          thumbnail: item.snippet?.thumbnails?.medium?.url,
          videoUrl: `https://www.youtube.com/watch?v=${item.id?.videoId}`
        }));
      } catch (e) {
        console.warn('[api/roadmap] YouTube fetch failed:', e.message);
      }
    }

    // 3) Optionally persist under user
    if (uid && admin?.firestore) {
      try {
        const resources = { general: { ytVideos: videos } };
        await admin.firestore().collection('users').doc(uid).set({
          roadmap: weeks,
          resources,
          aiPlanUpdatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('[api/roadmap] persist failed:', e.message);
      }
    }

    // Combined response
    return res.json({ roadmap: weeks, videos });
  } catch (error) {
    console.error('[api/roadmap] Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error generating roadmap and videos' });
  }
});

// Fetch saved plan (profile, roadmap, resources) without calling Gemini
app.get('/api/user/:uid/plan', async (req, res) => {
  try {
    const { uid } = req.params;
    const snap = await admin.firestore().collection('users').doc(uid).get();
    if (!snap.exists) return res.status(404).json({ error: 'User not found' });
    const data = snap.data() || {};
    const profile = data.profile || {};
    let roadmap = data.roadmap || [];
    if (typeof roadmap === 'string') { try { roadmap = JSON.parse(roadmap); } catch { roadmap = []; } }
    const resources = Object.keys(data.resources || {}).length ? data.resources : (data.aiPlan?.resources || {});
    const aiPlan = data.aiPlan || {};
    return res.json({ profile, roadmap, resources, aiPlan });
  } catch (e) {
    console.error('[api/user/:uid/plan] Error:', e.message);
    res.status(500).json({ error: 'Failed to fetch saved plan' });
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
