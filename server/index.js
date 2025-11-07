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

// CORS configuration - allow requests from frontend domains
const allowedOrigins = [
  'http://localhost:3000', // Local development
  process.env.FRONTEND_URL, // Production frontend URL from env
  'https://skillflux.netlify.app', // Netlify frontend (hardcoded for now)
].filter(Boolean); // Remove undefined values

// Log CORS configuration for debugging
console.log('🌐 CORS Allowed Origins:', allowedOrigins.length > 0 ? allowedOrigins : 'ALL (development mode)');
console.log('🌐 FRONTEND_URL from env:', process.env.FRONTEND_URL || 'NOT SET');

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('🚫 CORS blocked origin:', origin);
      callback(null, true); // Allow all for now, but log it
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Firebase Admin SDK
// Supports both local development (file path) and production (environment variable)
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // For production (Render/Railway) - use environment variable
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('Firebase Admin: Using service account from environment variable');
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error.message);
  }
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // For local development - use file path
  try {
    serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('Firebase Admin: Using service account from file');
  } catch (error) {
    console.error('Error loading service account file:', error.message);
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  // Ignore undefined properties to avoid Firestore errors on optional fields
  admin.firestore().settings({ ignoreUndefinedProperties: true });
  console.log('Firebase Admin initialized successfully');
} else {
  console.warn('Firebase Admin not initialized. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS');
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
    const { uid, name, email, skills, goals, preference, mode, resumeUrl, linkedin, education, role, targetRole, primarySkill, learningGoal, experienceLevel, careerAspiration, learningStyle } = req.body;
    
    console.log(`[onboarding] Received data:`, {
      uid, name, email, skills, goals, preference, mode, resumeUrl, linkedin, education, role, targetRole, 
      primarySkill, learningGoal, experienceLevel, careerAspiration, learningStyle
    });
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
      // Legacy fields (for backward compatibility)
      goals: typeof goals === 'string' ? goals : existingProfile.goals || '',
      preference: typeof preference === 'string' ? preference : existingProfile.preference || '',
      mode: typeof mode === 'string' ? mode : existingProfile.mode || '',
      // New onboarding fields
      primarySkill: typeof primarySkill === 'string' ? primarySkill : '',
      learningGoal: typeof learningGoal === 'string' ? learningGoal : '',
      experienceLevel: typeof experienceLevel === 'string' ? experienceLevel : '',
      careerAspiration: typeof careerAspiration === 'string' ? careerAspiration : '',
      learningStyle: typeof learningStyle === 'string' ? learningStyle : ''
    };
    
    console.log(`[onboarding] Storing onboarding data:`, profile.onboarding);

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

// Resume Analysis endpoint - Calculate ATS score using Gemini
app.post('/api/analyze-resume', async (req, res) => {
  try {
    // Ensure we always return JSON
    res.setHeader('Content-Type', 'application/json');
    
    const { resumeData, jobDescription } = req.body;
    
    if (!resumeData) {
      return res.status(400).json({ error: 'Resume data is required' });
    }

    console.log('[analyze-resume] Received resume data for analysis');

    // If no Gemini API key, return a fallback analysis
    if (!process.env.GEMINI_API_KEY) {
      console.warn('[analyze-resume] GEMINI_API_KEY not set, returning fallback analysis');
      const fallbackScore = Math.floor(Math.random() * 30) + 60; // 60-90 score
      return res.json({
        atsScore: fallbackScore,
        pros: [
          'Resume contains structured information',
          'Skills section is present',
          'Work experience is documented'
        ],
        cons: [
          'Consider adding more quantifiable achievements',
          'Include relevant keywords for better ATS matching',
          'Ensure consistent formatting throughout'
        ],
        skills: resumeData.skills || [],
        recommendations: [
          'Add more specific project details',
          'Include quantifiable results and metrics',
          'Tailor resume to match job description keywords'
        ],
        analysis: {
          summary: 'Resume analysis completed. For detailed ATS scoring, please configure GEMINI_API_KEY.',
          keywordMatch: 'N/A',
          formatting: 'Good',
          contentQuality: 'Good'
        }
      });
    }

    // Format resume data for Gemini analysis
    const resumeText = `
RESUME DATA:
Personal Information:
- Name: ${resumeData.personalInfo?.name || 'Not provided'}
- Email: ${resumeData.personalInfo?.email || 'Not provided'}
- Phone: ${resumeData.personalInfo?.phone || 'Not provided'}
- Location: ${resumeData.personalInfo?.location || 'Not provided'}
- LinkedIn: ${resumeData.personalInfo?.linkedin || 'Not provided'}
- GitHub: ${resumeData.personalInfo?.github || 'Not provided'}

Summary/Objective: ${resumeData.summary || 'Not provided'}

Skills: ${Array.isArray(resumeData.skills) ? resumeData.skills.join(', ') : 'Not provided'}

Work Experience:
${Array.isArray(resumeData.experience) && resumeData.experience.length > 0
  ? resumeData.experience.map(exp => 
    `- ${exp.position || 'Position'} at ${exp.company || 'Company'} (${exp.startDate || ''} - ${exp.endDate || exp.current ? 'Present' : ''})
  ${exp.description || ''}`
  ).join('\n')
  : 'Not provided'}

Education:
${Array.isArray(resumeData.education) && resumeData.education.length > 0
  ? resumeData.education.map(edu => 
    `- ${edu.degree || 'Degree'} in ${edu.field || 'Field'} from ${edu.institution || 'Institution'} (${edu.endDate || 'Year'})`
  ).join('\n')
  : 'Not provided'}

Projects:
${Array.isArray(resumeData.projects) && resumeData.projects.length > 0
  ? resumeData.projects.map(proj => 
    `- ${proj.name || 'Project'}: ${proj.description || ''}`
  ).join('\n')
  : 'Not provided'}

Certifications:
${Array.isArray(resumeData.certifications) && resumeData.certifications.length > 0
  ? resumeData.certifications.map(cert => 
    `- ${cert.name || 'Certification'} from ${cert.issuer || 'Issuer'} (${cert.date || 'Date'})`
  ).join('\n')
  : 'Not provided'}
`;

    // Create prompt for Gemini
    const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze the following resume and provide a comprehensive ATS score and feedback.

${jobDescription ? `\nTARGET JOB DESCRIPTION:\n${jobDescription}\n` : ''}

${resumeText}

Analyze this resume and provide:
1. An ATS score (0-100) based on:
   - Keyword optimization and relevance
   - Formatting and structure (ATS-friendly formatting)
   - Content completeness (all essential sections present)
   - Quantifiable achievements and metrics
   - Skills match with industry standards
   - Professional presentation

2. A list of pros (3-5 positive aspects)
3. A list of cons (3-5 areas for improvement)
4. Specific recommendations for improvement
5. A brief analysis summary

Return your response as STRICT JSON only (no markdown, no code fences) in this exact format:
{
  "atsScore": 75,
  "pros": ["pro 1", "pro 2", "pro 3"],
  "cons": ["con 1", "con 2", "con 3"],
  "recommendations": ["rec 1", "rec 2", "rec 3"],
  "analysis": {
    "summary": "Brief summary of the analysis",
    "keywordMatch": "Excellent/Good/Fair/Poor",
    "formatting": "ATS-Friendly/Needs Improvement",
    "contentQuality": "Excellent/Good/Fair/Poor"
  }
}`;

    // Call Gemini API
    const geminiResponse = await callGeminiGenerate(prompt, { 
      retries: 2, 
      timeout: AXIOS_TIMEOUT_MS, 
      model: 'gemini-2.5-flash' 
    });

    console.log('[analyze-resume] Gemini response received');

    // Parse Gemini response
    let analysisResult;
    try {
      // Try to extract JSON from response (in case it's wrapped in markdown)
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(geminiResponse);
      }
    } catch (parseError) {
      console.warn('[analyze-resume] Failed to parse Gemini response, using fallback');
      // Fallback if parsing fails
      analysisResult = {
        atsScore: 70,
        pros: ['Resume has structured sections', 'Skills are listed', 'Experience is documented'],
        cons: ['Could improve keyword optimization', 'Add more quantifiable results', 'Enhance formatting'],
        recommendations: ['Add more specific achievements', 'Include relevant keywords', 'Improve formatting consistency'],
        analysis: {
          summary: 'Resume analysis completed. Please review recommendations.',
          keywordMatch: 'Fair',
          formatting: 'Needs Improvement',
          contentQuality: 'Good'
        }
      };
    }

    // Ensure all required fields are present
    const result = {
      atsScore: typeof analysisResult.atsScore === 'number' ? analysisResult.atsScore : 70,
      pros: Array.isArray(analysisResult.pros) ? analysisResult.pros : [],
      cons: Array.isArray(analysisResult.cons) ? analysisResult.cons : [],
      recommendations: Array.isArray(analysisResult.recommendations) ? analysisResult.recommendations : [],
      skills: Array.isArray(resumeData.skills) ? resumeData.skills : [],
      analysis: analysisResult.analysis || {
        summary: 'Resume analysis completed.',
        keywordMatch: 'Fair',
        formatting: 'Good',
        contentQuality: 'Good'
      }
    };

    console.log(`[analyze-resume] Analysis complete, ATS score: ${result.atsScore}`);
    res.json(result);

  } catch (error) {
    console.error('[analyze-resume] Error:', error.message);
    res.status(500).json({ error: 'Failed to analyze resume: ' + error.message });
  }
});

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
    const onboardingMeta = typeof profile.onboarding === 'object' && profile.onboarding ? profile.onboarding : {};
    
    // Legacy fields (for backward compatibility)
    const targetGoal = typeof profile.goals === 'string' ? profile.goals : '';
    const pref = typeof profile.preference === 'string' ? profile.preference : '';
    const mode = typeof profile.mode === 'string' ? profile.mode : '';
    const name = typeof profile.name === 'string' ? profile.name : '';
    const email = typeof profile.email === 'string' ? profile.email : '';
    const education = typeof profile.education === 'string' ? profile.education : '';
    const role = typeof profile.role === 'string' ? profile.role : '';
    const targetRole = typeof profile.targetRole === 'string' ? profile.targetRole : '';

    console.log(`[generate-roadmap] profile data: skills=${userSkills.length}, onboarding=${JSON.stringify(onboardingMeta)}`);
    console.log(`[generate-roadmap] legacy data: goal="${targetGoal}", pref="${pref}", mode="${mode}", edu="${education}", role="${role}", targetRole="${targetRole}"`);

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
      
      // Structure data according to the new prompt requirements
      const signupData = {
        name,
        email,
        education,
        role,
        skills: userSkills,
        historicalSkills
      };
      
      const onboardingData = {
        primarySkill: onboardingMeta.primarySkill || '',
        learningGoal: onboardingMeta.learningGoal || '',
        experienceLevel: onboardingMeta.experienceLevel || '',
        careerAspiration: onboardingMeta.careerAspiration || '',
        learningStyle: onboardingMeta.learningStyle || ''
      };
      
      console.log(`[generate-roadmap] onboarding data:`, onboardingData);
      console.log(`[generate-roadmap] onboardingMeta keys:`, Object.keys(onboardingMeta));
      
      // Check if we have valid onboarding data
      const hasOnboardingData = onboardingData.primarySkill || onboardingData.learningGoal || onboardingData.experienceLevel;
      if (!hasOnboardingData) {
        console.warn(`[generate-roadmap] No onboarding data found, using legacy data`);
        // Fallback to legacy data if no onboarding data
        onboardingData.primarySkill = targetRole || 'General Skills';
        onboardingData.learningGoal = targetGoal || 'Career Development';
        onboardingData.experienceLevel = 'intermediate';
        onboardingData.careerAspiration = targetRole || '';
        onboardingData.learningStyle = pref || 'mixed';
      }
      
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
      const prompt = `You are a senior career mentor. Generate a structured learning roadmap that is centered ONLY on the user's PRIMARY SKILL INTEREST. 
Use signup data for background context and onboarding data for specific learning goals.

### USER CONTEXT
Signup Data: ${JSON.stringify(signupData)}
Onboarding Data: ${JSON.stringify(onboardingData)}

### GUIDELINES
1) Roadmap must focus on primarySkill (the exact skill user wants to learn now).
2) Use pastSkills and education (from signup) to:
   - Identify transferable knowledge
   - Highlight gaps between current skillset and the primarySkill
3) Adapt roadmap depth by experienceLevel (beginner | intermediate | advanced).
4) Adapt delivery style by learningStyle (visual = videos/diagrams; hands-on = projects; reading = docs/books; mixed = balanced).
5) Use learningGoal to shape outcomes (portfolio projects, certification, career switch, etc.).
6) Use careerAspiration ONLY for context:
   - Show how progress in primarySkill contributes toward that role
   - Suggest complementary skills needed for careerAspiration after finishing primarySkill
7) After roadmap, provide career context in "careerPathways":
   - "nextSkillsForTargetRole": what additional skills are required to fully qualify for the targetRole
   - "alternativeOpportunities": other roles or fields where the primarySkill is valuable
8) Do NOT fabricate URLs. Provide titles, platforms, or keywords only. Backend will attach actual links.

### RESPONSE FORMAT
Return STRICT JSON ONLY with this structure:

{
  "analysis": {
    "skillGaps": ["..."],
    "level": "beginner|intermediate|advanced",
    "summary": "Briefly explain user's current foundation, the gaps in primarySkill, and how filling them supports the careerAspiration."
  },
  "tips": ["Short, actionable tips tailored to learningStyle and experienceLevel"],
  "roadmap": [
    {
      "week": 1,
      "weeklyGoal": "...",
      "topics": ["..."],
      "projects": ["..."],
      "assessment": "quiz | mini-project | reflection",
      "roleAlignment": "How this week's learning in primarySkill helps progress toward careerAspiration"
    }
  ],
  "resources": {
    "recommendedSearchKeywords": ["..."],
    "books": [{"title":"...","author":"..."}],
    "courses": [{"title":"...","platform":"..."}],
    "videos": [{"title":"..."}]
  },
  "careerPathways": {
    "nextSkillsForTargetRole": ["..."],
    "alternativeOpportunities": ["..."]
  }
}

### CONTEXT PRIORITY
- Primary focus: primarySkill="${onboardingData.primarySkill}"
- Learning goal: "${onboardingData.learningGoal}"
- Experience level: "${onboardingData.experienceLevel}"
- Learning style: "${onboardingData.learningStyle}"
- Target role context: "${onboardingData.careerAspiration}"
- Past skills (from signup): ${signupData.skills}
- Education: ${signupData.education}

Remember: The ROADMAP is ONLY for primarySkill. Career pathways provide the bigger picture.
`;
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

// Tech news endpoint (NewsAPI proxy with basic caching)
const NEWS_CACHE_TTL_MS = parseInt(process.env.NEWS_CACHE_TTL_MS || '60000', 10); // 60s default
let newsCache = { key: '', timestamp: 0, payload: null };

app.get('/api/news', async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    const { q = '', category = 'technology', pageSize = '20', language = 'en' } = req.query || {};
    const search = (q || category || 'technology').toString();
    const cacheKey = `${search}|${pageSize}|${language}`;

    if (newsCache.payload && newsCache.key === cacheKey && (Date.now() - newsCache.timestamp) < NEWS_CACHE_TTL_MS) {
      return res.json(newsCache.payload);
    }

    if (!apiKey) {
      // Fallback to static demo when no API key
      const payload = {
        status: 'fallback',
        articles: [
          { title: 'Tech News Fallback', description: 'Provide NEWS_API_KEY to enable live news.', url: 'https://newsapi.org', urlToImage: '', publishedAt: new Date().toISOString(), source: { name: 'Local' } }
        ]
      };
      newsCache = { key: cacheKey, timestamp: Date.now(), payload };
      return res.json(payload);
    }

    // Detect provider (supports NewsAPI.org and Newsdata.io). You can force via NEWS_PROVIDER=newsapi|newsdata
    const providerEnv = (process.env.NEWS_PROVIDER || '').toLowerCase();
    const isNewsDataKey = typeof apiKey === 'string' && apiKey.startsWith('pub_');
    const provider = providerEnv || (isNewsDataKey ? 'newsdata' : 'newsapi');

    let payload;
    if (provider === 'newsdata') {
      // Newsdata.io
      const url = 'https://newsdata.io/api/1/news';
      const params = {
        apikey: apiKey,
        q: search,
        language,
        category
      };
      const response = await axios.get(url, { params, timeout: AXIOS_TIMEOUT_MS });
      const data = response.data || {};
      const articles = (data.results || []).map(r => ({
        title: r.title,
        description: r.description,
        url: r.link,
        urlToImage: r.image_url,
        publishedAt: r.pubDate,
        source: { name: r.source_id }
      }));
      payload = { status: 'ok', provider: 'newsdata', totalResults: articles.length, articles };
    } else {
      // NewsAPI.org
      const params = {
        q: search,
        language,
        sortBy: 'publishedAt',
        pageSize,
        apiKey
      };
      const url = 'https://newsapi.org/v2/everything';
      const response = await axios.get(url, { params, timeout: AXIOS_TIMEOUT_MS });
      const data = response.data || {};
      payload = { status: data.status || 'ok', provider: 'newsapi', totalResults: data.totalResults, articles: data.articles || [] };
    }

    newsCache = { key: cacheKey, timestamp: Date.now(), payload };
    res.json(payload);
  } catch (err) {
    console.error('[api/news] Error:', err.response?.data || err.message);
    // Serve cached if available
    if (newsCache.payload) {
      return res.json({ ...newsCache.payload, cached: true });
    }
    // Graceful fallback with 200 status
    const fallback = {
      status: 'fallback',
      provider: 'fallback',
      totalResults: 1,
      articles: [
        {
          title: 'Live tech news temporarily unavailable',
          description: 'Showing fallback content. Please try again shortly.',
          url: 'https://newsdata.io/ or https://newsapi.org/',
          urlToImage: '',
          publishedAt: new Date().toISOString(),
          source: { name: 'Local' }
        }
      ]
    };
    newsCache = { key: 'fallback', timestamp: Date.now(), payload: fallback };
    return res.json(fallback);
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

// Fetch aptitude questions from database
app.post('/api/aptitude-questions', async (req, res) => {
  try {
    const { category = 'general', count = 5 } = req.body || {};
    console.log(`[aptitude-questions] Fetching ${count} questions for category: ${category}`);
    
    const db = admin.firestore();
    
    // Get random questions from the specified category
    const snapshot = await db.collection('aptitude_questions')
      .where('category', '==', category)
      .limit(50) // Get more than needed to randomize
      .get();
    
    if (snapshot.empty) {
      console.warn(`[aptitude-questions] No questions found for category: ${category}`);
      return res.status(404).json({ error: `No questions available for ${category} category` });
    }
    
    // Convert to array and shuffle
    const allQuestions = [];
    snapshot.forEach(doc => {
      allQuestions.push({ id: doc.id, ...doc.data() });
    });
    
    // Shuffle and take the requested number
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));
    
    console.log(`[aptitude-questions] Returning ${selectedQuestions.length} questions for ${category}`);
    res.json({ questions: selectedQuestions });
    
  } catch (error) {
    console.error('[aptitude-questions] Error:', error);
    res.status(500).json({ error: 'Failed to fetch aptitude questions.' });
  }
});

// Endpoint to check if questions are available
app.get('/api/aptitude-status', async (req, res) => {
  try {
    const db = admin.firestore();
    const categories = ['general', 'quantitative', 'logical', 'verbal'];
    const status = {};
    
    for (const category of categories) {
      const snapshot = await db.collection('aptitude_questions')
        .where('category', '==', category)
        .limit(1)
        .get();
      
      status[category] = {
        available: !snapshot.empty,
        count: snapshot.empty ? 0 : await db.collection('aptitude_questions')
          .where('category', '==', category)
          .get()
          .then(s => s.size)
      };
    }
    
    res.json({ status });
  } catch (error) {
    console.error('[aptitude-status] Error:', error);
    res.status(500).json({ error: 'Failed to check aptitude status.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
