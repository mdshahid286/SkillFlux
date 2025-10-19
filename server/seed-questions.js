const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const questionsData = {
  general: [
    {
      question: "What is the next number in the sequence: 2, 4, 8, 16, ...?",
      options: ["22", "32", "24", "36"],
      answer: "32",
      explanation: "Each number is multiplied by 2 to get the next number in the sequence.",
      difficulty: "medium"
    },
    {
      question: "If a clock shows 3:15, what is the angle between the hour and minute hands?",
      options: ["0°", "7.5°", "15°", "22.5°"],
      answer: "7.5°",
      explanation: "At 3:15, the hour hand is at 3.25 (3 + 15/60) and minute hand at 3. The angle is (3.25-3) × 30° = 7.5°.",
      difficulty: "hard"
    },
    {
      question: "A cube has a volume of 64 cubic units. What is its surface area?",
      options: ["96", "64", "48", "32"],
      answer: "96",
      explanation: "Volume = side³ = 64, so side = 4. Surface area = 6 × side² = 6 × 16 = 96.",
      difficulty: "medium"
    },
    {
      question: "What is the missing number: 1, 4, 9, 16, __, 36?",
      options: ["20", "25", "30", "24"],
      answer: "25",
      explanation: "This is the sequence of perfect squares: 1², 2², 3², 4², 5², 6².",
      difficulty: "easy"
    },
    {
      question: "If 3x + 7 = 22, what is x?",
      options: ["5", "6", "7", "8"],
      answer: "5",
      explanation: "3x + 7 = 22, so 3x = 15, therefore x = 5.",
      difficulty: "easy"
    },
    {
      question: "What is the sum of the first 10 natural numbers?",
      options: ["45", "55", "65", "75"],
      answer: "55",
      explanation: "Sum of first n natural numbers = n(n+1)/2 = 10(11)/2 = 55.",
      difficulty: "medium"
    },
    {
      question: "If today is Wednesday, what day will it be 100 days from now?",
      options: ["Thursday", "Friday", "Saturday", "Sunday"],
      answer: "Friday",
      explanation: "100 days = 14 weeks + 2 days. 14 weeks later is Wednesday, +2 days = Friday.",
      difficulty: "medium"
    },
    {
      question: "What is the value of 2⁴ + 3²?",
      options: ["25", "17", "19", "23"],
      answer: "25",
      explanation: "2⁴ = 16 and 3² = 9, so 16 + 9 = 25.",
      difficulty: "easy"
    },
    {
      question: "A number is increased by 20% and then decreased by 20%. What is the net change?",
      options: ["No change", "4% decrease", "4% increase", "20% decrease"],
      answer: "4% decrease",
      explanation: "If original = 100, after 20% increase = 120, after 20% decrease = 96. Net change = 4% decrease.",
      difficulty: "hard"
    },
    {
      question: "What is the next number: 1, 3, 6, 10, 15, __?",
      options: ["20", "21", "22", "24"],
      answer: "21",
      explanation: "This is the sequence of triangular numbers: 1, 1+2=3, 1+2+3=6, 1+2+3+4=10, etc. Next is 1+2+3+4+5+6=21.",
      difficulty: "medium"
    }
  ],
  quantitative: [
    {
      question: "A train of length 100m is moving at 30km/h. How long will it take to cross a pole?",
      options: ["12s", "10s", "15s", "18s"],
      answer: "12s",
      explanation: "Convert 30 km/h = 8.33 m/s. Time = 100m / 8.33 m/s ≈ 12s.",
      difficulty: "medium"
    },
    {
      question: "If the ratio of boys to girls in a class is 3:2, and there are 30 students, how many boys are there?",
      options: ["12", "15", "18", "20"],
      answer: "18",
      explanation: "Total ratio parts = 3+2 = 5. Boys = (3/5) × 30 = 18.",
      difficulty: "medium"
    },
    {
      question: "What is 25% of 120?",
      options: ["30", "25", "35", "40"],
      answer: "30",
      explanation: "25% of 120 = 0.25 × 120 = 30.",
      difficulty: "easy"
    },
    {
      question: "A rectangle has length 8cm and width 6cm. What is its perimeter?",
      options: ["28cm", "24cm", "48cm", "14cm"],
      answer: "28cm",
      explanation: "Perimeter = 2(length + width) = 2(8 + 6) = 2(14) = 28cm.",
      difficulty: "easy"
    },
    {
      question: "If a car travels 60km in 1.5 hours, what is its average speed?",
      options: ["40 km/h", "45 km/h", "50 km/h", "35 km/h"],
      answer: "40 km/h",
      explanation: "Speed = Distance/Time = 60km / 1.5h = 40 km/h.",
      difficulty: "easy"
    },
    {
      question: "What is the compound interest on $1000 at 10% per annum for 2 years?",
      options: ["$210", "$200", "$220", "$190"],
      answer: "$210",
      explanation: "Amount = P(1+r)ⁿ = 1000(1.1)² = 1210. Interest = 1210 - 1000 = $210.",
      difficulty: "hard"
    },
    {
      question: "If 5 machines can produce 5 widgets in 5 minutes, how many machines are needed to produce 100 widgets in 100 minutes?",
      options: ["5", "10", "20", "100"],
      answer: "5",
      explanation: "Each machine produces 1 widget in 5 minutes, so 1 widget per minute. For 100 widgets in 100 minutes, need 5 machines.",
      difficulty: "hard"
    },
    {
      question: "What is the area of a circle with radius 7cm?",
      options: ["154 cm²", "44 cm²", "22 cm²", "77 cm²"],
      answer: "154 cm²",
      explanation: "Area = πr² = (22/7) × 7² = (22/7) × 49 = 154 cm².",
      difficulty: "medium"
    },
    {
      question: "A shopkeeper marks his goods 20% above cost price and gives a discount of 10%. What is his profit percentage?",
      options: ["8%", "10%", "12%", "15%"],
      answer: "8%",
      explanation: "Let CP = 100. Marked price = 120. After 10% discount, SP = 108. Profit = 8%.",
      difficulty: "hard"
    },
    {
      question: "What is the time taken by a train 150m long running at 72 km/h to cross a bridge 250m long?",
      options: ["20s", "18s", "25s", "30s"],
      answer: "20s",
      explanation: "Total distance = 150 + 250 = 400m. Speed = 72 km/h = 20 m/s. Time = 400/20 = 20s.",
      difficulty: "medium"
    }
  ],
  logical: [
    {
      question: "Which word does NOT belong: Apple, Banana, Carrot, Mango?",
      options: ["Apple", "Banana", "Carrot", "Mango"],
      answer: "Carrot",
      explanation: "Carrot is a vegetable while Apple, Banana, and Mango are all fruits.",
      difficulty: "easy"
    },
    {
      question: "If all roses are flowers and some flowers are red, which statement must be true?",
      options: ["All roses are red", "Some roses are red", "No roses are red", "Cannot be determined"],
      answer: "Cannot be determined",
      explanation: "We know roses are flowers and some flowers are red, but this doesn't guarantee any roses are red.",
      difficulty: "hard"
    },
    {
      question: "Complete the pattern: A, C, E, G, __",
      options: ["H", "I", "F", "J"],
      answer: "I",
      explanation: "The pattern skips one letter: A (skip B) C (skip D) E (skip F) G (skip H) I.",
      difficulty: "easy"
    },
    {
      question: "If Monday is the 3rd, what day of the week is the 10th?",
      options: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      answer: "Monday",
      explanation: "From 3rd (Monday) to 10th is 7 days later, which is the same day of the week.",
      difficulty: "medium"
    },
    {
      question: "Which number comes next: 1, 1, 2, 3, 5, 8, __",
      options: ["11", "12", "13", "15"],
      answer: "13",
      explanation: "This is the Fibonacci sequence where each number is the sum of the two preceding numbers.",
      difficulty: "medium"
    },
    {
      question: "If some cats are dogs and all dogs are animals, which statement is true?",
      options: ["All cats are animals", "Some cats are animals", "No cats are animals", "Cannot be determined"],
      answer: "Some cats are animals",
      explanation: "Since some cats are dogs and all dogs are animals, it follows that some cats are animals.",
      difficulty: "medium"
    },
    {
      question: "What is the next letter in the sequence: A, D, G, J, __?",
      options: ["K", "L", "M", "N"],
      answer: "M",
      explanation: "The pattern increases by 3 letters each time: A+3=D, D+3=G, G+3=J, J+3=M.",
      difficulty: "easy"
    },
    {
      question: "If RED is coded as 1854, how is GREEN coded?",
      options: ["755146", "755145", "755147", "755148"],
      answer: "755146",
      explanation: "RED: R=18, E=5, D=4. GREEN: G=7, R=18, E=5, E=5, N=14. So 7-18-5-5-14-6.",
      difficulty: "hard"
    },
    {
      question: "In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written?",
      options: ["MFEDJJOE", "EOJDEJFM", "MJDJEOFE", "EOJDJEFM"],
      answer: "EOJDEJFM",
      explanation: "The coding pattern reverses the word and shifts each letter by 1 position backward.",
      difficulty: "hard"
    },
    {
      question: "If in a certain language, MADRAS is coded as NBESBT, how is BOMBAY coded in that language?",
      options: ["CPNCBZ", "CPNCBX", "CPNCBY", "CPNCBA"],
      answer: "CPNCBZ",
      explanation: "Each letter is shifted by 1 position forward in the alphabet.",
      difficulty: "medium"
    }
  ],
  verbal: [
    {
      question: "Find the synonym of 'Abundant'.",
      options: ["Scarce", "Plentiful", "Empty", "Small"],
      answer: "Plentiful",
      explanation: "Abundant means existing in large quantities, which is synonymous with plentiful.",
      difficulty: "easy"
    },
    {
      question: "What is the antonym of 'Benevolent'?",
      options: ["Kind", "Generous", "Malevolent", "Charitable"],
      answer: "Malevolent",
      explanation: "Benevolent means well-meaning and kindly, while malevolent means having or showing a wish to do evil.",
      difficulty: "medium"
    },
    {
      question: "Choose the correct spelling:",
      options: ["Occurence", "Occurrence", "Occurance", "Occurense"],
      answer: "Occurrence",
      explanation: "The correct spelling is 'occurrence' with double 'r' and double 'c'.",
      difficulty: "easy"
    },
    {
      question: "Which sentence is grammatically correct?",
      options: ["He don't like apples", "He doesn't likes apples", "He doesn't like apples", "He don't likes apples"],
      answer: "He doesn't like apples",
      explanation: "Third person singular uses 'doesn't' (not 'don't') and the base form of the verb (not 'likes').",
      difficulty: "easy"
    },
    {
      question: "What is the meaning of 'Ephemeral'?",
      options: ["Lasting forever", "Very short-lived", "Extremely large", "Completely silent"],
      answer: "Very short-lived",
      explanation: "Ephemeral means lasting for a very short time or transient.",
      difficulty: "medium"
    },
    {
      question: "Identify the correctly spelled word:",
      options: ["Seperate", "Separate", "Seperrate", "Separete"],
      answer: "Separate",
      explanation: "The correct spelling is 'separate' with 'a' in the second syllable.",
      difficulty: "easy"
    },
    {
      question: "What is the synonym of 'Meticulous'?",
      options: ["Careless", "Careful", "Thoughtful", "Detailed"],
      answer: "Careful",
      explanation: "Meticulous means showing great attention to detail; very careful and precise.",
      difficulty: "medium"
    },
    {
      question: "Which word is most similar in meaning to 'Ubiquitous'?",
      options: ["Rare", "Common", "Everywhere", "Nowhere"],
      answer: "Everywhere",
      explanation: "Ubiquitous means present, appearing, or found everywhere.",
      difficulty: "hard"
    },
    {
      question: "Choose the correct preposition: The book is ___ the table.",
      options: ["in", "on", "at", "by"],
      answer: "on",
      explanation: "When something is placed on top of a surface, we use 'on'.",
      difficulty: "easy"
    },
    {
      question: "What is the plural of 'Analysis'?",
      options: ["Analysises", "Analyses", "Analysises", "Analysis"],
      answer: "Analyses",
      explanation: "The plural of 'analysis' is 'analyses', following the Greek plural form.",
      difficulty: "medium"
    }
  ]
};

async function seedQuestions() {
  console.log('🌱 Starting to seed aptitude questions...');
  
  const db = admin.firestore();
  let totalSeeded = 0;

  for (const [category, questions] of Object.entries(questionsData)) {
    console.log(`\n📝 Seeding ${questions.length} questions for category: ${category}`);
    
    const batch = db.batch();
    
    questions.forEach((question, index) => {
      const docRef = db.collection('aptitude_questions').doc(`${category}_${index + 1}`);
      batch.set(docRef, {
        ...question,
        id: `${category}_${index + 1}`,
        category,
        createdAt: new Date().toISOString()
      });
    });
    
    try {
      await batch.commit();
      console.log(`✅ Successfully seeded ${questions.length} questions for ${category}`);
      totalSeeded += questions.length;
      
      // Update category summary
      const summaryRef = db.collection('aptitude_categories').doc(category);
      await summaryRef.set({
        category,
        totalQuestions: questions.length,
        lastUpdated: new Date().toISOString(),
        status: 'active'
      });
      console.log(`📊 Updated summary for ${category}`);
      
    } catch (error) {
      console.error(`❌ Failed to seed questions for ${category}:`, error.message);
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`📈 Total questions seeded: ${totalSeeded}`);
  
  // Test retrieval
  console.log('\n🧪 Testing question retrieval...');
  try {
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

seedQuestions().catch(error => {
  console.error('💥 Seeding failed:', error);
  process.exit(1);
});
