/**
 * One-time script: generate lessons + quiz questions via Groq,
 * then translate to Hausa, Yoruba, and Igbo. Saves to Supabase.
 * Run: npm run generate-lessons
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const Groq = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js');

// ─── Configuration ───────────────────────────────────────────────────────────

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_MAX_TOKENS = 8192;
const CALL_DELAY_MS = 1000;
const TRANSLATE_DELAY_MS = 500;

const TRANSLATION_LANGUAGES = ['ha', 'yo', 'ig'];

const SYSTEM_PROMPT = `You are an expert Nigerian primary school curriculum writer.
Follow the NERDC curriculum strictly.
Always use Nigerian names, places, and currency (Naira).
Write at the appropriate level for the grade.
Be clear and simple enough for Nigerian children.`;

const SUBJECTS_BY_GRADE = {
  1: [
    { subject: 'English Studies', topics: [
      'Letter Sounds and Phonics',
      'Sight Words and Reading',
      'Nouns and Action Words',
      'Simple Sentences',
      'Tracing and Copying',
    ]},
    { subject: 'Mathematics', topics: [
      'Counting 1 to 100',
      'Addition',
      'Subtraction',
      'Shapes',
      'Telling Time',
    ]},
    { subject: 'Basic Science & Technology', topics: [
      'Living and Non-Living Things',
      'Parts of the Human Body',
      'Plants and Animals',
      'Water and Its Uses',
      'Simple Tools',
    ]},
    { subject: 'Physical & Health Education', topics: [
      'Running and Jumping',
      'Hand Washing',
      'Playground Safety',
      'Healthy Foods',
      'Cleaning Teeth',
    ]},
    { subject: 'CRS / Islamic Studies', topics: [
      'Creation Story',
      'Early Prophets',
      'Prayer and Worship',
      'Kindness and Respect',
      'Honesty',
    ]},
    { subject: 'Nigerian History', topics: [
      'My Family and Community',
      'Nigerian Flag and Anthem',
      'Famous Nigerians',
      'Our Local Heroes',
      'Independence Day',
    ]},
    { subject: 'Social & Citizenship Studies', topics: [
      'My Family',
      'Community Helpers',
      'Road Safety',
      'Our Culture',
      'Being a Good Citizen',
    ]},
    { subject: 'Cultural & Creative Arts', topics: [
      'Primary Colors',
      'Drawing and Colouring',
      'Simple Paper Crafts',
      'Nigerian Songs',
      'Drama and Roleplay',
    ]},
    { subject: 'Basic Digital Literacy', topics: [
      'What is a Computer',
      'Parts of a Computer',
      'Using a Mouse',
      'Typing Basics',
      'Staying Safe Online',
    ]},
    { subject: 'Confidence Building', topics: [
      'Believing in Yourself',
      'Speaking Up',
      'Trying New Things',
      'Learning from Mistakes',
      'Celebrating Success',
    ]},
    { subject: 'Hygiene Development', topics: [
      'Hand Washing',
      'Brushing Teeth',
      'Bathing',
      'Clean Clothes',
      'Clean Environment',
    ]},
    { subject: 'Communication', topics: [
      'Listening Skills',
      'Speaking Clearly',
      'Polite Words',
      'Body Language',
      'Sharing Ideas',
    ]},
    { subject: 'Leadership', topics: [
      'Being a Good Example',
      'Helping Others',
      'Taking Turns',
      'Responsibility',
      'School Helpers',
    ]},
    { subject: 'Teamwork', topics: [
      'Playing Together',
      'Sharing Tasks',
      'Supporting Friends',
      'Winning Together',
      'Resolving Disputes',
    ]},
    { subject: 'Creativity', topics: [
      'Drawing Ideas',
      'Making Stories',
      'Building with Blocks',
      'Music and Rhythm',
      'Imaginative Play',
    ]},
    { subject: 'Yorùbá Language', topics: [
      'Greetings in Yoruba',
      'Numbers in Yoruba',
      'Family Words',
      'Colours in Yoruba',
      'Simple Phrases',
    ]},
    { subject: 'Igbo Language', topics: [
      'Greetings in Igbo',
      'Numbers in Igbo',
      'Family Words',
      'Colours in Igbo',
      'Simple Phrases',
    ]},
    { subject: 'Hausa Language', topics: [
      'Greetings in Hausa',
      'Numbers in Hausa',
      'Family Words',
      'Colours in Hausa',
      'Simple Phrases',
    ]},
  ],
  2: [
    { subject: 'English Studies', topics: [
      'Vowels and Consonants',
      'Reading Short Stories',
      'Nouns and Verbs',
      'Simple Sentences',
      'Spelling Common Words',
    ]},
    { subject: 'Mathematics', topics: [
      'Counting 1 to 500',
      'Multiplication Intro',
      'Division Intro',
      'Fractions Half and Quarter',
      'Money and Prices',
    ]},
    { subject: 'Basic Science & Technology', topics: [
      'The Human Senses',
      'Weather and Seasons',
      'Soil and Its Uses',
      'Air and Wind',
      'Simple Machines',
    ]},
    { subject: 'Physical & Health Education', topics: [
      'Running and Relay',
      'Jumping and Skipping',
      'Nutrition Basics',
      'Personal Hygiene',
      'Team Games',
    ]},
    { subject: 'CRS / Islamic Studies', topics: [
      'Life of Abraham',
      'Five Pillars of Islam',
      'Honesty and Forgiveness',
      'Love and Service',
      'Worship and Prayer',
    ]},
    { subject: 'Nigerian History', topics: [
      'Nigerian States',
      'Pre-Colonial Nigeria',
      'Trade Routes',
      'Cultural Heritage',
      'Famous Leaders',
    ]},
    { subject: 'Social & Citizenship Studies', topics: [
      'Types of Families',
      'Our Government',
      'Transportation',
      'Nigerian Culture',
      'Festivals and Celebrations',
    ]},
    { subject: 'Cultural & Creative Arts', topics: [
      'Nigerian Music',
      'Folk Tales',
      'Drama and Acting',
      'Weaving and Crafts',
      'Pottery',
    ]},
    { subject: 'Basic Digital Literacy', topics: [
      'Keyboard Skills',
      'Drawing on Computer',
      'Internet Basics',
      'Password Safety',
      'Educational Games',
    ]},
    { subject: 'Confidence Building', topics: [
      'Setting Small Goals',
      'Facing Fears',
      'Positive Self Talk',
      'Asking for Help',
      'Praising Effort',
    ]},
    { subject: 'Hygiene Development', topics: [
      'Personal Grooming',
      'Nail Care',
      'Hair Care',
      'Healthy Habits',
      'School Cleanliness',
    ]},
    { subject: 'Communication', topics: [
      'Asking Questions',
      'Telling Stories',
      'Expressing Feelings',
      'Polite Words',
      'Group Discussions',
    ]},
    { subject: 'Leadership', topics: [
      'Class Monitor Duties',
      'Encouraging Friends',
      'Fairness',
      'Following Rules',
      'Leading Activities',
    ]},
    { subject: 'Teamwork', topics: [
      'Group Projects',
      'Supporting Teammates',
      'Sharing Ideas',
      'Cooperating in Games',
      'Celebrating Together',
    ]},
    { subject: 'Creativity', topics: [
      'Craft Making',
      'Storytelling',
      'Drawing Patterns',
      'Singing and Dancing',
      'Inventing Games',
    ]},
    { subject: 'Yorùbá Language', topics: [
      'Days of the Week',
      'Food Words',
      'Animals in Yoruba',
      'Body Parts',
      'Short Sentences',
    ]},
    { subject: 'Igbo Language', topics: [
      'Days of the Week',
      'Food Words',
      'Animals in Igbo',
      'Body Parts',
      'Short Sentences',
    ]},
    { subject: 'Hausa Language', topics: [
      'Days of the Week',
      'Food Words',
      'Animals in Hausa',
      'Body Parts',
      'Short Sentences',
    ]},
  ],
  3: [
    { subject: 'English Studies', topics: [
      'Phoneme Identification',
      'Comprehension Passages',
      'Parts of Speech',
      'Punctuation',
      'Letter Writing',
    ]},
    { subject: 'Mathematics', topics: [
      'Multiplication Tables',
      'Long Division',
      'Fractions',
      'Decimals',
      'Geometry Basics',
    ]},
    { subject: 'Basic Science & Technology', topics: [
      'Food Chains',
      'Ecosystems',
      'Rocks and Soil',
      'Forces and Motion',
      'Simple Machines',
    ]},
    { subject: 'Physical & Health Education', topics: [
      'Athletics',
      'Team Sports',
      'First Aid Basics',
      'Disease Prevention',
      'Growth and Development',
    ]},
    { subject: 'CRS / Islamic Studies', topics: [
      'The Ten Commandments',
      'Wudhu and Cleanliness',
      'Prophets and Heroes',
      'Charity and Giving',
      'Fasting and Sacrifice',
    ]},
    { subject: 'Nigerian History', topics: [
      'Nigerian Kingdoms',
      'Colonial History',
      'Road to Independence',
      'National Heroes',
      'Post Colonial Nigeria',
    ]},
    { subject: 'Social & Citizenship Studies', topics: [
      'Nigerian Geography',
      'Agriculture in Nigeria',
      'Trade and Markets',
      'Transport Systems',
      'National Symbols',
    ]},
    { subject: 'Cultural & Creative Arts', topics: [
      'Nigerian Art',
      'Sculpture and Crafts',
      'Batik and Tie Dye',
      'Music Instruments',
      'Performing Arts',
    ]},
    { subject: 'Basic Digital Literacy', topics: [
      'File Management',
      'Word Processing Basics',
      'Safe Internet Use',
      'Digital Communication',
      'Introduction to Coding',
    ]},
    { subject: 'Confidence Building', topics: [
      'Public Speaking',
      'Self Awareness',
      'Overcoming Stage Fright',
      'Goal Setting',
      'Positive Mindset',
    ]},
    { subject: 'Hygiene Development', topics: [
      'Dental Hygiene',
      'Skin Care',
      'Waste Management',
      'Study Space Cleanliness',
      'Disease Prevention',
    ]},
    { subject: 'Communication', topics: [
      'Active Listening',
      'Clear Speaking',
      'Non Verbal Communication',
      'Giving Feedback',
      'Conflict Resolution',
    ]},
    { subject: 'Leadership', topics: [
      'Delegating Tasks',
      'Managing Resources',
      'Conflict Mediation',
      'Accountability',
      'Inspiring Others',
    ]},
    { subject: 'Teamwork', topics: [
      'Group Research',
      'Defining Roles',
      'Supporting Peers',
      'Brainstorming',
      'Collaborative Success',
    ]},
    { subject: 'Creativity', topics: [
      'Alternative Solutions',
      'Breaking Down Problems',
      'Designing Prototypes',
      'Innovative Drawing',
      'Creative Writing',
    ]},
    { subject: 'Yorùbá Language', topics: [
      'Yoruba Alphabet',
      'Simple Conversations',
      'Describing People',
      'Yoruba Proverbs',
      'Reading Short Texts',
    ]},
    { subject: 'Igbo Language', topics: [
      'Igbo Alphabet',
      'Simple Conversations',
      'Describing People',
      'Igbo Proverbs',
      'Reading Short Texts',
    ]},
    { subject: 'Hausa Language', topics: [
      'Hausa Alphabet',
      'Simple Conversations',
      'Describing People',
      'Hausa Proverbs',
      'Reading Short Texts',
    ]},
  ],
  4: [
    { subject: 'English Studies', topics: [
      'Word Stress and Intonation',
      'Eight Parts of Speech',
      'Subject Verb Agreement',
      'Narrative Essay Writing',
      'Formal and Informal Letters',
    ]},
    { subject: 'Mathematics', topics: [
      'LCM and HCF',
      'Percentages',
      'Ratios',
      'Area and Perimeter',
      'Data and Graphs',
    ]},
    { subject: 'Basic Science & Technology', topics: [
      'Human Skeletal System',
      'Digestive System',
      'Forms of Energy',
      'Simple Electrical Circuits',
      'Engineering Materials',
    ]},
    { subject: 'Physical & Health Education', topics: [
      'Track and Field',
      'Ball Games Rules',
      'Puberty and Body Changes',
      'Reproductive Health',
      'Drug Awareness',
    ]},
    { subject: 'CRS / Islamic Studies', topics: [
      'Life of Jesus Christ',
      'Life of Prophet Muhammad',
      'Ethics and Justice',
      'Tolerance and Peace',
      'Community Service',
    ]},
    { subject: 'Nigerian History', topics: [
      'Oyo Empire',
      'Benin Kingdom',
      'Sokoto Caliphate',
      'Amalgamation of 1914',
      'Nigerian Independence 1960',
    ]},
    { subject: 'Social & Citizenship Studies', topics: [
      'Structure of Government',
      'Rights and Duties',
      'Leadership and Accountability',
      'National Symbols',
      'Drug and Substance Abuse',
    ]},
    { subject: 'Cultural & Creative Arts', topics: [
      'Secondary Color Mixing',
      'Traditional Motifs',
      'Tie and Dye',
      'Printmaking',
      'Graphic Design Intro',
    ]},
    { subject: 'Basic Digital Literacy', topics: [
      'Desktop Operations',
      'Web Safety',
      'Constructing Emails',
      'Scratch Coding Basics',
      'Introduction to AI',
    ]},
    { subject: 'Confidence Building', topics: [
      'Vocal Projection',
      'Eye Contact',
      'Strengths Identification',
      'Emotion Management',
      'Presenting Ideas',
    ]},
    { subject: 'Hygiene Development', topics: [
      'Comprehensive Dental Care',
      'Nail Grooming',
      'Skin Protection',
      'Domestic Waste Management',
      'Eliminating Disease Vectors',
    ]},
    { subject: 'Communication', topics: [
      'Reflective Listening',
      'Facial Expressions',
      'Professional Posture',
      'Spatial Boundaries',
      'Polite Responses',
    ]},
    { subject: 'Leadership', topics: [
      'Peer Assignment Delegation',
      'Setting Deadlines',
      'Managing Shared Resources',
      'Mediating Disagreements',
      'Win Win Outcomes',
    ]},
    { subject: 'Teamwork', topics: [
      'Group Research Methods',
      'Specialized Roles',
      'Supporting Struggling Peers',
      'Brainstorming Sessions',
      'Validating Team Success',
    ]},
    { subject: 'Creativity', topics: [
      'Designing Solutions',
      'Breaking Complex Tasks',
      'Overcoming Blockages',
      'Prototypes from Local Waste',
      'Transforming Errors',
    ]},
    { subject: 'Yorùbá Language', topics: [
      'Yoruba Grammar',
      'Reading Passages',
      'Writing in Yoruba',
      'Yoruba Literature',
      'Oral Presentations',
    ]},
    { subject: 'Igbo Language', topics: [
      'Igbo Grammar',
      'Reading Passages',
      'Writing in Igbo',
      'Igbo Literature',
      'Oral Presentations',
    ]},
    { subject: 'Hausa Language', topics: [
      'Hausa Grammar',
      'Reading Passages',
      'Writing in Hausa',
      'Hausa Literature',
      'Oral Presentations',
    ]},
  ],
  5: [
    { subject: 'English Studies', topics: [
      'Debate and Public Speaking',
      'Critical Reading',
      'Figures of Speech',
      'Summary Writing',
      'Argumentative Essays',
    ]},
    { subject: 'Mathematics', topics: [
      'Linear Equations',
      'Geometry Angles',
      'Profit and Loss',
      'Simple Interest',
      'Statistics and Charts',
    ]},
    { subject: 'Basic Science & Technology', topics: [
      'Cells and Organisms',
      'Chemical Changes',
      'Solar System',
      'Technology and Innovation',
      'Environmental Science',
    ]},
    { subject: 'Physical & Health Education', topics: [
      'Advanced Athletics',
      'HIV and AIDS Awareness',
      'Substance Abuse',
      'Mental Health',
      'Sports Injuries',
    ]},
    { subject: 'CRS / Islamic Studies', topics: [
      'World Religions Overview',
      'Peace and Dialogue',
      'Morality in Society',
      'Spirituality and Faith',
      'Religious Conflicts',
    ]},
    { subject: 'Nigerian History', topics: [
      'ECOWAS and West Africa',
      'Nigerian Civil War',
      'Post Independence Leaders',
      'Democracy in Nigeria',
      'Nigeria and the World',
    ]},
    { subject: 'Social & Citizenship Studies', topics: [
      'Electoral Process',
      'Rule of Law',
      'Corruption and Effects',
      'National Values',
      'Global Citizenship',
    ]},
    { subject: 'Cultural & Creative Arts', topics: [
      'Art History',
      'World Music',
      'Film Making Basics',
      'Nollywood',
      'Afrobeats and Culture',
    ]},
    { subject: 'Basic Digital Literacy', topics: [
      'Advanced Web Safety',
      'Digital Footprint',
      'Big Data Concepts',
      'AI and Society',
      'Coding Logic',
    ]},
    { subject: 'Confidence Building', topics: [
      'Advanced Public Speaking',
      'Personal Branding',
      'Handling Criticism',
      'Resilience Building',
      'Inspiring Others',
    ]},
    { subject: 'Hygiene Development', topics: [
      'Advanced Personal Care',
      'Environmental Health',
      'Community Sanitation',
      'Disease Outbreak Prevention',
      'Mental Wellness and Hygiene',
    ]},
    { subject: 'Communication', topics: [
      'Advanced Listening',
      'Persuasive Communication',
      'Digital Communication',
      'Cross Cultural Communication',
      'Conflict De-escalation',
    ]},
    { subject: 'Leadership', topics: [
      'Strategic Planning',
      'Community Leadership',
      'Ethics in Leadership',
      'Motivating Others',
      'Leadership Styles',
    ]},
    { subject: 'Teamwork', topics: [
      'Complex Group Projects',
      'Role Specialization',
      'Peer Mentoring',
      'Celebrating Diversity',
      'Team Conflict Resolution',
    ]},
    { subject: 'Creativity', topics: [
      'Innovation Thinking',
      'Design Thinking Process',
      'Creative Entrepreneurship',
      'Art from Recycled Materials',
      'Presenting Creative Work',
    ]},
    { subject: 'Yorùbá Language', topics: [
      'Advanced Yoruba Grammar',
      'Yoruba Poetry',
      'Cultural Expressions',
      'Yoruba History through Language',
      'Debates in Yoruba',
    ]},
    { subject: 'Igbo Language', topics: [
      'Advanced Igbo Grammar',
      'Igbo Poetry',
      'Cultural Expressions',
      'Igbo History through Language',
      'Debates in Igbo',
    ]},
    { subject: 'Hausa Language', topics: [
      'Advanced Hausa Grammar',
      'Hausa Poetry',
      'Cultural Expressions',
      'Hausa History through Language',
      'Debates in Hausa',
    ]},
  ],
  6: [
    { subject: 'English Studies', topics: [
      'Advanced Essay Writing',
      'Poetry Analysis',
      'Drama and Literature',
      'Public Speaking',
      'Critical Thinking and Reading',
    ]},
    { subject: 'Mathematics', topics: [
      'Quadratic Equations',
      'Trigonometry Intro',
      'Probability',
      'Financial Mathematics',
      'Advanced Statistics',
    ]},
    { subject: 'Basic Science & Technology', topics: [
      'Genetics Basics',
      'Climate Change',
      'Nuclear Energy Intro',
      'Biotechnology',
      'Future Technologies',
    ]},
    { subject: 'Physical & Health Education', topics: [
      'Advanced First Aid',
      'Nutrition Science',
      'Mental Wellness',
      'Sports Leadership',
      'Lifelong Fitness',
    ]},
    { subject: 'CRS / Islamic Studies', topics: [
      'Comparative Religion',
      'Faith and Science',
      'Social Justice',
      'End of Life and Afterlife',
      'Religious Leadership',
    ]},
    { subject: 'Nigerian History', topics: [
      'United Nations and Nigeria',
      'Globalisation',
      'Human Rights in Nigeria',
      'Sustainable Development',
      'Nigerias Future',
    ]},
    { subject: 'Social & Citizenship Studies', topics: [
      'Constitutional Rights',
      'Civic Responsibility',
      'Anti Corruption',
      'Peace Building',
      'Diplomacy and Foreign Policy',
    ]},
    { subject: 'Cultural & Creative Arts', topics: [
      'Contemporary Nigerian Art',
      'Digital Art',
      'Music Production',
      'Nigerian Cinema',
      'Creative Writing and Publishing',
    ]},
    { subject: 'Basic Digital Literacy', topics: [
      'Advanced Coding',
      'Cybersecurity Basics',
      'Artificial Intelligence Ethics',
      'Digital Entrepreneurship',
      'Building Simple Apps',
    ]},
    { subject: 'Confidence Building', topics: [
      'Leadership Presence',
      'Advanced Self Awareness',
      'Life Vision Setting',
      'Overcoming Major Challenges',
      'Legacy and Impact',
    ]},
    { subject: 'Hygiene Development', topics: [
      'Holistic Health',
      'Community Health Leadership',
      'Environmental Sustainability',
      'Advanced Disease Prevention',
      'Health Advocacy',
    ]},
    { subject: 'Communication', topics: [
      'Professional Communication',
      'Public Relations Basics',
      'Media Literacy',
      'Negotiation Skills',
      'Advanced Presentations',
    ]},
    { subject: 'Leadership', topics: [
      'Visionary Leadership',
      'Social Entrepreneurship',
      'National Development',
      'Mentoring Others',
      'Leading Change',
    ]},
    { subject: 'Teamwork', topics: [
      'Leading Complex Teams',
      'Inter School Collaboration',
      'Community Impact Projects',
      'Global Teamwork',
      'Legacy Projects',
    ]},
    { subject: 'Creativity', topics: [
      'Advanced Design Thinking',
      'Social Innovation',
      'Creative Leadership',
      'Building a Portfolio',
      'Pitching Creative Ideas',
    ]},
    { subject: 'Yorùbá Language', topics: [
      'Yoruba Literature Analysis',
      'Advanced Writing',
      'Oral Tradition',
      'Yoruba in Modern World',
      'Final Presentations',
    ]},
    { subject: 'Igbo Language', topics: [
      'Igbo Literature Analysis',
      'Advanced Writing',
      'Oral Tradition',
      'Igbo in Modern World',
      'Final Presentations',
    ]},
    { subject: 'Hausa Language', topics: [
      'Hausa Literature Analysis',
      'Advanced Writing',
      'Oral Tradition',
      'Hausa in Modern World',
      'Final Presentations',
    ]},
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUserPrompt(grade, subject, topic) {
  return `Write a complete, detailed lesson for:
Grade: ${grade}
Subject: ${subject}
Topic: ${topic}
Language: English

The lesson MUST be minimum 800 words. Be thorough and detailed.

Return ONLY a raw JSON object, no markdown, no backticks, no explanation:
{
  "content": "Full lesson with these sections clearly labelled:\\n\\n**Introduction** - Engage the child, explain why this topic matters in Nigerian daily life\\n\\n**Explanation** - Thorough explanation of the concept in simple language a Primary ${grade} child understands\\n\\n**Examples** - At least 3 detailed Nigerian examples using Nigerian names (Chidi, Amina, Tunde etc), places (Lagos, Kano, Abuja etc) and Naira\\n\\n**Key Points** - At least 5 bullet points summarising what was learned\\n\\n**Activities** - 2 fun hands-on activities a Nigerian child can do at home or school\\n\\n**Fun Facts** - 2 interesting facts related to the topic in a Nigerian context\\n\\nMinimum 800 words total.",
  "summary": "3-4 sentence summary of the lesson",
  "learning_objectives": [
    "objective 1",
    "objective 2",
    "objective 3",
    "objective 4"
  ],
  "nigerian_examples": [
    "detailed example 1",
    "detailed example 2",
    "detailed example 3"
  ],
  "quiz_questions": [
    {
      "question_type": "multiple_choice",
      "question": "question text",
      "option_a": "option A",
      "option_b": "option B",
      "option_c": "option C",
      "option_d": "option D",
      "correct_answer": "A",
      "explanation": "detailed explanation of why this is correct"
    },
    {
      "question_type": "multiple_choice",
      "question": "question text",
      "option_a": "option A",
      "option_b": "option B",
      "option_c": "option C",
      "option_d": "option D",
      "correct_answer": "B",
      "explanation": "detailed explanation of why this is correct"
    },
    {
      "question_type": "multiple_choice",
      "question": "question text",
      "option_a": "option A",
      "option_b": "option B",
      "option_c": "option C",
      "option_d": "option D",
      "correct_answer": "C",
      "explanation": "detailed explanation of why this is correct"
    },
    {
      "question_type": "true_false",
      "question": "true or false statement",
      "option_a": "True",
      "option_b": "False",
      "option_c": null,
      "option_d": null,
      "correct_answer": "A",
      "explanation": "detailed explanation"
    },
    {
      "question_type": "true_false",
      "question": "true or false statement",
      "option_a": "True",
      "option_b": "False",
      "option_c": null,
      "option_d": null,
      "correct_answer": "B",
      "explanation": "detailed explanation"
    }
  ]
}`;
}

function stripMarkdownFences(text) {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

function parseJsonResponse(text) {
  const cleaned = stripMarkdownFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('invalid JSON');
  }
}

function validateLessonPayload(parsed) {
  if (!parsed.content || !parsed.summary) {
    throw new Error('Groq response missing content or summary');
  }
  if (!Array.isArray(parsed.learning_objectives) || parsed.learning_objectives.length === 0) {
    throw new Error('Groq response missing learning_objectives');
  }
  if (!Array.isArray(parsed.nigerian_examples)) {
    throw new Error('Groq response missing nigerian_examples');
  }
  if (!Array.isArray(parsed.quiz_questions) || parsed.quiz_questions.length === 0) {
    throw new Error('Groq response missing quiz_questions');
  }
}

async function lessonExists(supabase, grade, subject, topic, language = 'en') {
  const { data, error } = await supabase
    .from('lessons')
    .select('id')
    .eq('grade', grade)
    .eq('subject', subject)
    .eq('topic', topic)
    .eq('language', language)
    .maybeSingle();

  if (error) throw new Error(`Supabase check failed: ${error.message}`);
  return Boolean(data);
}

async function generateWithRetry(groq, grade, subject, topic, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 8192,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(grade, subject, topic) },
        ],
      });
      let text = completion.choices[0].message.content;
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON object found');
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    } catch (e) {
      console.log(`⚠️  Attempt ${attempt}/${maxRetries} failed for ${subject} | ${topic}: ${e.message}`);
      if (attempt < maxRetries) await sleep(2000);
    }
  }
  return null;
}

async function translateText(text, targetLang) {
  if (!text || text.trim() === '') return text;
  try {
    let input = String(text);
    if (input.length > 4500) {
      input = input.slice(0, 4500);
    }
    const langMap = { ha: 'ha', yo: 'yo', ig: 'ig' };
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(input)}&langpair=en|${langMap[targetLang]}`;
    const response = await fetch(url);
    const data = await response.json();
    await sleep(TRANSLATE_DELAY_MS);
    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    }
    return text;
  } catch (e) {
    await sleep(TRANSLATE_DELAY_MS);
    return text;
  }
}

async function translateStringArray(items, to) {
  const translated = [];
  for (const item of items) {
    translated.push(await translateText(item, to));
  }
  return translated;
}

async function translateLesson(englishParsed, targetLang) {
  const content = await translateText(englishParsed.content, targetLang);
  const summary = await translateText(englishParsed.summary, targetLang);
  const learning_objectives = await translateStringArray(
    englishParsed.learning_objectives,
    targetLang
  );
  const nigerian_examples = await translateStringArray(
    englishParsed.nigerian_examples,
    targetLang
  );

  const quiz_questions = [];
  for (const q of englishParsed.quiz_questions) {
    quiz_questions.push({
      question_type: q.question_type,
      question: await translateText(q.question, targetLang),
      option_a: await translateText(q.option_a, targetLang),
      option_b: await translateText(q.option_b, targetLang),
      option_c: q.option_c != null ? await translateText(q.option_c, targetLang) : null,
      option_d: q.option_d != null ? await translateText(q.option_d, targetLang) : null,
      correct_answer: q.correct_answer,
      explanation: await translateText(q.explanation, targetLang),
    });
  }

  return {
    content,
    summary,
    learning_objectives,
    nigerian_examples,
    quiz_questions,
  };
}

async function saveLesson(supabase, grade, subject, topic, language, parsed) {
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .insert({
      grade,
      subject,
      topic,
      language,
      content: parsed.content,
      summary: parsed.summary,
      learning_objectives: parsed.learning_objectives,
      nigerian_examples: parsed.nigerian_examples,
    })
    .select('id')
    .single();

  if (lessonError) throw new Error(`Lesson insert failed: ${lessonError.message}`);

  const quizRows = parsed.quiz_questions.map((q) => ({
    lesson_id: lesson.id,
    grade,
    subject,
    topic,
    language,
    question_type: q.question_type,
    question: q.question,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
  }));

  const { error: quizError } = await supabase.from('quiz_questions').insert(quizRows);
  if (quizError) throw new Error(`Quiz insert failed: ${quizError.message}`);

  return quizRows.length;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const groqKey = process.env.GROQ_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing = [];
  if (!groqKey) missing.push('GROQ_API_KEY');
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  const groq = new Groq({ apiKey: groqKey });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let lessonsGenerated = 0;
  let quizQuestionsGenerated = 0;
  let failed = 0;

  console.log('Starting lesson generation (Groq + Google Translate)...\n');

  for (let grade = 1; grade <= 6; grade += 1) {
    const subjects = SUBJECTS_BY_GRADE[grade];
    if (!subjects) continue;

    for (const { subject, topics } of subjects) {
      for (const topic of topics) {
        const label = `Grade ${grade} | ${subject} | ${topic}`;

        try {
          const exists = await lessonExists(supabase, grade, subject, topic, 'en');
          if (exists) {
            console.log(`⏭️  SKIP (exists): ${label}`);
            continue;
          }

          const englishParsed = await generateWithRetry(groq, grade, subject, topic);
          if (!englishParsed) {
            failed += 1;
            console.log(`❌ FAILED: ${label}`);
            await sleep(CALL_DELAY_MS);
            continue;
          }
          validateLessonPayload(englishParsed);
          await sleep(CALL_DELAY_MS);

          const englishQuizCount = await saveLesson(
            supabase,
            grade,
            subject,
            topic,
            'en',
            englishParsed
          );
          lessonsGenerated += 1;
          quizQuestionsGenerated += englishQuizCount;

          for (const lang of TRANSLATION_LANGUAGES) {
            const translatedParsed = await translateLesson(englishParsed, lang);
            const translatedQuizCount = await saveLesson(
              supabase,
              grade,
              subject,
              topic,
              lang,
              translatedParsed
            );
            lessonsGenerated += 1;
            quizQuestionsGenerated += translatedQuizCount;
          }

          console.log(`✅ ${label}`);
        } catch (err) {
          failed += 1;
          const message = err instanceof Error ? err.message : String(err);
          if (message === 'invalid JSON') {
            console.log(`❌ FAILED ${grade} | ${subject} | ${topic}: invalid JSON`);
          } else {
            console.log(`❌ FAILED: ${label} | ${message}`);
          }
        }

        await sleep(CALL_DELAY_MS);
      }
    }
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`Total lessons generated: ${lessonsGenerated}`);
  console.log(`Total quiz questions generated: ${quizQuestionsGenerated}`);
  console.log(`Failed: ${failed}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
