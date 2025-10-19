const admin = require('firebase-admin');
const axios = require('axios');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const AXIOS_TIMEOUT_MS = 45000;

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

async function generateQuestionsForCategory(category) {
  console.log(`\n🎯 Generating questions for category: ${category}`);
  
  const prompt = `Generate 20 high-quality multiple-choice aptitude questions for the category: "${category}".

For each question, provide a JSON object with this exact structure:
{
  "question": "Clear, well-formulated question text ending with ?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": "Option A",  // Must exactly match one of the options
  "explanation": "Detailed explanation of why this answer is correct"
}

Requirements:
- Questions should be college-level difficulty
- Cover various subtopics within ${category} aptitude
- Each question should have exactly 4 options (A, B, C, D)
- Answer must exactly match one of the provided options
- Explanations should be educational and clear
- Make questions original and challenging

Return STRICT JSON ONLY: an array of 20 such objects. No prose, no code fences, no commentary.`;

  try {
    const text = await callGeminiGenerate(prompt, { model: 'gemini-2.5-flash' });
    
    // Parse JSON from response
    let questions = [];
    try {
      const start = text.indexOf('[');
      const end = text.lastIndexOf(']');
      const slice = start !== -1 && end !== -1 && end > start ? text.slice(start, end + 1) : text;
      const parsed = JSON.parse(slice);
      
      if (Array.isArray(parsed)) {
        questions = parsed.map((q, index) => ({
          id: `${category}_${index + 1}`,
          category,
          question: q.question || '',
          options: Array.isArray(q.options) ? q.options : [],
          answer: q.answer || '',
          explanation: q.explanation || '',
          difficulty: 'medium',
          createdAt: new Date().toISOString()
        }));
      }
    } catch (parseError) {
      console.error(`❌ Failed to parse JSON for ${category}:`, parseError.message);
      return [];
    }

    console.log(`✅ Generated ${questions.length} questions for ${category}`);
    return questions;
  } catch (error) {
    console.error(`❌ Failed to generate questions for ${category}:`, error.message);
    return [];
  }
}

async function storeQuestionsInDatabase(questions, category) {
  try {
    const db = admin.firestore();
    
    // Store questions in the aptitude_questions collection
    const batch = db.batch();
    
    questions.forEach((question, index) => {
      const docRef = db.collection('aptitude_questions').doc(`${category}_${index + 1}`);
      batch.set(docRef, question);
    });
    
    await batch.commit();
    console.log(`💾 Stored ${questions.length} questions for ${category} in database`);
    
    // Also store a summary document
    const summaryRef = db.collection('aptitude_categories').doc(category);
    await summaryRef.set({
      category,
      totalQuestions: questions.length,
      lastUpdated: new Date().toISOString(),
      status: 'active'
    });
    
    console.log(`📊 Updated summary for ${category}`);
  } catch (error) {
    console.error(`❌ Failed to store questions for ${category}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting aptitude questions generation...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    console.log('Please set your Gemini API key in the .env file');
    process.exit(1);
  }

  const categories = ['general', 'quantitative', 'logical', 'verbal'];
  let totalGenerated = 0;

  for (const category of categories) {
    try {
      const questions = await generateQuestionsForCategory(category);
      
      if (questions.length > 0) {
        await storeQuestionsInDatabase(questions, category);
        totalGenerated += questions.length;
        
        // Add delay between categories to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Error processing category ${category}:`, error.message);
    }
  }

  console.log(`\n🎉 Generation complete!`);
  console.log(`📈 Total questions generated: ${totalGenerated}`);
  console.log(`📂 Categories processed: ${categories.join(', ')}`);
  
  // Test fetching questions
  console.log('\n🧪 Testing question retrieval...');
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('aptitude_questions').where('category', '==', 'general').limit(3).get();
    console.log(`✅ Successfully retrieved ${snapshot.size} test questions from database`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.question.substring(0, 50)}...`);
    });
  } catch (error) {
    console.error('❌ Error testing retrieval:', error.message);
  }

  process.exit(0);
}

main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
