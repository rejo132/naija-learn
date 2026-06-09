/**
 * One-time script: generate lessons + quiz questions via Claude and save to Supabase.
 * Run: npm run generate-lessons
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

// ─── Configuration ───────────────────────────────────────────────────────────

const LANGUAGES = ['en', 'ha'];

const LANGUAGE_NAMES = {
  en: 'English',
  ha: 'Hausa',
};

const SUBJECTS_BY_GRADE = {
  1: [
    { subject: 'English Studies', topics: ['Reading & Comprehension', 'Grammar & Punctuation', 'Vocabulary', 'Creative Writing', 'Spelling'] },
    { subject: 'Mathematics', topics: ['Numbers & Counting', 'Addition & Subtraction', 'Shapes & Geometry', 'Word Problems', 'Measurement'] },
    { subject: 'Basic Science & Technology', topics: ['Living Things', 'Plants & Animals', 'Human Body', 'Weather & Environment', 'Health & Hygiene'] },
    { subject: 'Physical & Health Education', topics: ['Exercise', 'Cleanliness', 'Safety', 'Games', 'Healthy Food'] },
    { subject: 'CRS / Islamic Studies', topics: ['Greetings', 'Prayer', 'Kindness', 'Sharing', 'Gratitude'] },
    { subject: 'Nigerian History', topics: ['My Local Area', 'Famous Nigerians', 'Nigerian Flag', 'Independence Day', 'National Heroes'] },
    { subject: 'Social & Citizenship Studies', topics: ['My Family & Community', 'Nigeria & Its People', 'Our Government', 'Map Reading', 'Culture & Festivals'] },
    { subject: 'Cultural & Creative Arts', topics: ['Drawing', 'Colouring', 'Singing', 'Dancing', 'Crafts'] },
    { subject: 'Basic Digital Literacy', topics: ['Parts of a Computer', 'Using a Mouse', 'Typing Basics', 'Staying Safe Online', 'Fun Learning Apps'] },
    { subject: 'Yorùbá Language', topics: ['Greetings', 'Numbers', 'Family Words', 'Colours', 'Simple Phrases'] },
    { subject: 'Igbo Language', topics: ['Greetings', 'Numbers', 'Family Words', 'Colours', 'Simple Phrases'] },
    { subject: 'Hausa Language', topics: ['Greetings', 'Numbers', 'Family Words', 'Colours', 'Simple Phrases'] },
    { subject: 'Confidence Building', topics: ['Believing in Yourself', 'Trying New Things', 'Speaking Up', 'Celebrating Success', 'Learning from Mistakes'] },
    { subject: 'Hygiene Development', topics: ['Hand Washing', 'Bathing', 'Teeth Brushing', 'Clean Clothes', 'Clean Environment'] },
    { subject: 'Communication', topics: ['Listening Skills', 'Speaking Clearly', 'Please and Thank You', 'Body Language', 'Sharing Ideas'] },
    { subject: 'Leadership', topics: ['Being a Good Example', 'Helping Others', 'Taking Turns', 'Responsibility', 'School Helpers'] },
    { subject: 'Teamwork', topics: ['Playing Together', 'Sharing Tasks', 'Listening to Friends', 'Winning Together', 'Resolving Small Disputes'] },
    { subject: 'Creativity', topics: ['Drawing Ideas', 'Making Stories', 'Building with Blocks', 'Music and Rhythm', 'Imaginative Play'] },
  ],
  2: [
    { subject: 'English Studies', topics: ['Reading & Comprehension', 'Grammar & Punctuation', 'Vocabulary', 'Creative Writing', 'Spelling'] },
    { subject: 'Mathematics', topics: ['Numbers & Counting', 'Addition & Subtraction', 'Multiplication & Division', 'Fractions', 'Word Problems'] },
    { subject: 'Basic Science & Technology', topics: ['Living Things', 'Plants & Animals', 'Human Body', 'Weather & Environment', 'Simple Machines'] },
    { subject: 'Physical & Health Education', topics: ['Running', 'Jumping', 'Nutrition', 'Hygiene', 'Team Games'] },
    { subject: 'CRS / Islamic Studies', topics: ['Honesty', 'Forgiveness', 'Love', 'Service', 'Worship'] },
    { subject: 'Nigerian History', topics: ['Nigerian States', 'Pre-colonial Nigeria', 'Trade Routes', 'Cultural Heritage', 'Famous Leaders'] },
    { subject: 'Social & Citizenship Studies', topics: ['My Family & Community', 'Nigeria & Its People', 'Our Government', 'Transportation', 'Culture & Festivals'] },
    { subject: 'Cultural & Creative Arts', topics: ['Nigerian Music', 'Folk Tales', 'Drama', 'Weaving', 'Pottery'] },
    { subject: 'Basic Digital Literacy', topics: ['Keyboard Skills', 'Drawing on Computer', 'Internet Basics', 'Password Safety', 'Educational Games'] },
    { subject: 'Yorùbá Language', topics: ['Days of the Week', 'Food Words', 'Animals', 'Body Parts', 'Short Sentences'] },
    { subject: 'Igbo Language', topics: ['Days of the Week', 'Food Words', 'Animals', 'Body Parts', 'Short Sentences'] },
    { subject: 'Hausa Language', topics: ['Days of the Week', 'Food Words', 'Animals', 'Body Parts', 'Short Sentences'] },
    { subject: 'Confidence Building', topics: ['Setting Small Goals', 'Facing Fears', 'Positive Self-Talk', 'Asking for Help', 'Praising Effort'] },
    { subject: 'Hygiene Development', topics: ['Personal Grooming', 'Nail Care', 'Hair Care', 'Healthy Habits', 'School Cleanliness'] },
    { subject: 'Communication', topics: ['Asking Questions', 'Telling Stories', 'Expressing Feelings', 'Polite Words', 'Group Discussions'] },
    { subject: 'Leadership', topics: ['Class Monitor Duties', 'Encouraging Friends', 'Fairness', 'Following Rules', 'Leading Activities'] },
    { subject: 'Teamwork', topics: ['Group Projects', 'Supporting Teammates', 'Sharing Ideas', 'Cooperating in Games', 'Celebrating Together'] },
    { subject: 'Creativity', topics: ['Story Writing', 'Role Play', 'Pattern Making', 'Inventing Games', 'Art from Nature'] },
  ],
  3: [
    { subject: 'English Studies', topics: ['Reading & Comprehension', 'Grammar & Punctuation', 'Vocabulary', 'Creative Writing', 'Spelling'] },
    { subject: 'Mathematics', topics: ['Multiplication & Division', 'Fractions', 'Shapes & Geometry', 'Word Problems', 'Decimals Intro'] },
    { subject: 'Basic Science & Technology', topics: ['Living Things', 'Plants & Animals', 'Human Body', 'Weather & Environment', 'Simple Machines'] },
    { subject: 'Physical & Health Education', topics: ['Athletics', 'Team Sports', 'First Aid', 'Disease Prevention', 'Growth'] },
    { subject: 'CRS / Islamic Studies', topics: ['Prophets', 'Holy Books', 'Pilgrimage', 'Fasting', 'Charity'] },
    { subject: 'Nigerian History', topics: ['Colonial Period', 'Independence Movement', 'Nigerian Regions', 'Agriculture History', 'Transport History'] },
    { subject: 'Social & Citizenship Studies', topics: ['My Family & Community', 'Nigeria & Its People', 'Our Government', 'Map Reading', 'Transportation'] },
    { subject: 'Cultural & Creative Arts', topics: ['Nigerian Art', 'Sculpture', 'Batik', 'Tie and Dye', 'Music Instruments'] },
    { subject: 'Basic Digital Literacy', topics: ['Word Processing', 'Email Basics', 'Online Research', 'Cyberbullying Awareness', 'Digital Citizenship'] },
    { subject: 'Yorùbá Language', topics: ['Proverbs Intro', 'Storytelling', 'Questions', 'Directions', 'Cultural Words'] },
    { subject: 'Igbo Language', topics: ['Proverbs Intro', 'Storytelling', 'Questions', 'Directions', 'Cultural Words'] },
    { subject: 'Hausa Language', topics: ['Proverbs Intro', 'Storytelling', 'Questions', 'Directions', 'Cultural Words'] },
    { subject: 'Confidence Building', topics: ['Handling Mistakes', 'Standing Up for Yourself', 'Public Speaking Basics', 'Growth Mindset', 'Resilience'] },
    { subject: 'Hygiene Development', topics: ['Food Hygiene', 'Water Safety', 'Preventing Illness', 'Sanitation at Home', 'Healthy Routines'] },
    { subject: 'Communication', topics: ['Active Listening', 'Giving Compliments', 'Apologising Well', 'Non-verbal Cues', 'Presenting Ideas'] },
    { subject: 'Leadership', topics: ['Problem Solving', 'Organising Events', 'Mentoring Younger Pupils', 'Decision Making', 'Integrity'] },
    { subject: 'Teamwork', topics: ['Planning Together', 'Dividing Roles', 'Conflict Resolution', 'Trust Building', 'Achieving Group Goals'] },
    { subject: 'Creativity', topics: ['Design Challenges', 'Creative Writing', 'Improvisation', 'Recycling Art', 'Music Composition'] },
  ],
  4: [
    { subject: 'English Studies', topics: ['Reading & Comprehension', 'Grammar & Punctuation', 'Vocabulary', 'Creative Writing', 'Spelling'] },
    { subject: 'Mathematics', topics: ['Fractions', 'Shapes & Geometry', 'Word Problems', 'Percentages', 'Algebra Intro'] },
    { subject: 'Basic Science & Technology', topics: ['Photosynthesis', 'Electricity', 'Magnetism', 'Technology Tools', 'Environmental Care'] },
    { subject: 'Physical & Health Education', topics: ['Puberty', 'Reproductive Health', 'Mental Health', 'Sports Rules', 'Fitness'] },
    { subject: 'CRS / Islamic Studies', topics: ['Ethics', 'Justice', 'Tolerance', 'Leadership', 'Community Service'] },
    { subject: 'Nigerian History', topics: ['Civil War Era', 'Military Rule', 'Democracy Return', 'Natural Resources', 'Population Growth'] },
    { subject: 'Social & Citizenship Studies', topics: ['My Family & Community', 'Nigeria & Its People', 'Our Government', 'Map Reading', 'Culture & Festivals'] },
    { subject: 'Cultural & Creative Arts', topics: ['Nollywood', 'Nigerian Literature', 'Afrobeats', 'Architecture', 'Fashion'] },
    { subject: 'Basic Digital Literacy', topics: ['Spreadsheets Intro', 'Coding Basics', 'Social Media Safety', 'Fake News', 'Online Privacy'] },
    { subject: 'Yorùbá Language', topics: ['Reading Passages', 'Writing Sentences', 'Festivals', 'Traditions', 'Conversation'] },
    { subject: 'Igbo Language', topics: ['Reading Passages', 'Writing Sentences', 'Festivals', 'Traditions', 'Conversation'] },
    { subject: 'Hausa Language', topics: ['Reading Passages', 'Writing Sentences', 'Festivals', 'Traditions', 'Conversation'] },
    { subject: 'Confidence Building', topics: ['Overcoming Shyness', 'Handling Criticism', 'Setting Personal Goals', 'Self-Advocacy', 'Embracing Uniqueness'] },
    { subject: 'Hygiene Development', topics: ['Menstrual Hygiene', 'Personal Space Cleanliness', 'Waste Disposal', 'Community Cleanliness', 'Health Checkups'] },
    { subject: 'Communication', topics: ['Persuasive Speaking', 'Writing Messages', 'Interview Basics', 'Respectful Disagreement', 'Digital Communication'] },
    { subject: 'Leadership', topics: ['Vision Setting', 'Delegating Tasks', 'Accountability', 'Inspiring Others', 'Servant Leadership'] },
    { subject: 'Teamwork', topics: ['Sports Teams', 'Study Groups', 'Peer Support', 'Negotiation Skills', 'Shared Responsibility'] },
    { subject: 'Creativity', topics: ['Graphic Design Intro', 'Short Film Ideas', 'Innovation Challenges', 'Creative Problem Solving', 'Cultural Expression'] },
  ],
  5: [
    { subject: 'English Studies', topics: ['Reading & Comprehension', 'Grammar & Punctuation', 'Vocabulary', 'Creative Writing', 'Spelling'] },
    { subject: 'Mathematics', topics: ['Word Problems', 'Geometry Angles', 'Data Handling', 'Profit and Loss', 'Linear Equations'] },
    { subject: 'Basic Science & Technology', topics: ['Cells', 'Energy Forms', 'Solar System', 'Simple Technology', 'Climate Change Intro'] },
    { subject: 'Physical & Health Education', topics: ['HIV/AIDS Awareness', 'Substance Abuse', 'Fitness Training', 'Sports Injuries', 'Nutrition'] },
    { subject: 'CRS / Islamic Studies', topics: ['World Religions', 'Peace', 'Dialogue', 'Morality', 'Spirituality'] },
    { subject: 'Nigerian History', topics: ['ECOWAS and West Africa', 'African Unity', 'Global Nigeria', 'Citizenship History', 'Modern Nigeria'] },
    { subject: 'Social & Citizenship Studies', topics: ['My Family & Community', 'Nigeria & Its People', 'Our Government', 'Transportation', 'Culture & Festivals'] },
    { subject: 'Cultural & Creative Arts', topics: ['Art History', 'World Music', 'Film Making', 'Graphic Design', 'Performance'] },
    { subject: 'Basic Digital Literacy', topics: ['Presentation Tools', 'Block Coding', 'Digital Footprint', 'Online Scams', 'Tech for Learning'] },
    { subject: 'Yorùbá Language', topics: ['Grammar Basics', 'Letter Writing', 'Yoruba Heroes', 'Literature Intro', 'Debates'] },
    { subject: 'Igbo Language', topics: ['Grammar Basics', 'Letter Writing', 'Igbo Heroes', 'Literature Intro', 'Debates'] },
    { subject: 'Hausa Language', topics: ['Grammar Basics', 'Letter Writing', 'Hausa Heroes', 'Literature Intro', 'Debates'] },
    { subject: 'Confidence Building', topics: ['Managing Peer Pressure', 'Building Self-Esteem', 'Taking Initiative', 'Handling Failure', 'Personal Strengths'] },
    { subject: 'Hygiene Development', topics: ['Environmental Health', 'Food Safety at Home', 'Personal Boundaries', 'Healthy Lifestyle Choices', 'Community Health'] },
    { subject: 'Communication', topics: ['Debate Skills', 'Report Writing', 'Active Feedback', 'Cross-cultural Communication', 'Media Literacy'] },
    { subject: 'Leadership', topics: ['Project Leadership', 'Ethical Decisions', 'Conflict Mediation', 'Role Models', 'Community Impact'] },
    { subject: 'Teamwork', topics: ['Leadership in Teams', 'Diverse Teams', 'Remote Collaboration', 'Feedback Culture', 'Team Celebrations'] },
    { subject: 'Creativity', topics: ['Entrepreneurship Ideas', 'Design Thinking', 'Digital Art', 'Performance Arts', 'Innovation Projects'] },
  ],
  6: [
    { subject: 'English Studies', topics: ['Reading & Comprehension', 'Grammar & Punctuation', 'Vocabulary', 'Creative Writing', 'Spelling'] },
    { subject: 'Mathematics', topics: ['Quadratic Equations', 'Trigonometry Intro', 'Probability', 'Vectors Intro', 'Financial Maths'] },
    { subject: 'Basic Science & Technology', topics: ['Genetics Intro', 'Biotechnology', 'Renewable Energy', 'Robotics Intro', 'Climate Action'] },
    { subject: 'Physical & Health Education', topics: ['Advanced First Aid', 'Nutrition Science', 'Mental Wellness', 'Sports Leadership', 'Lifelong Fitness'] },
    { subject: 'CRS / Islamic Studies', topics: ['Comparative Religion', 'Faith and Science', 'Social Justice', 'Religious Tolerance', 'End of Life'] },
    { subject: 'Nigerian History', topics: ['United Nations Role', 'Globalisation', 'Migration', 'Human Rights in Nigeria', 'Sustainable Nigeria'] },
    { subject: 'Social & Citizenship Studies', topics: ['My Family & Community', 'Nigeria & Its People', 'Our Government', 'Map Reading', 'Transportation'] },
    { subject: 'Cultural & Creative Arts', topics: ['Contemporary Art', 'Digital Art', 'Nigerian Cinema', 'Music Production', 'Creative Writing'] },
    { subject: 'Basic Digital Literacy', topics: ['Advanced Coding Intro', 'Digital Ethics', 'AI Basics', 'Online Collaboration', 'Career Tech Skills'] },
    { subject: 'Yorùbá Language', topics: ['Advanced Grammar', 'Poetry', 'History in Yoruba', 'Translation', 'Public Speaking'] },
    { subject: 'Igbo Language', topics: ['Advanced Grammar', 'Poetry', 'History in Igbo', 'Translation', 'Public Speaking'] },
    { subject: 'Hausa Language', topics: ['Advanced Grammar', 'Poetry', 'History in Hausa', 'Translation', 'Public Speaking'] },
    { subject: 'Confidence Building', topics: ['Transition to Secondary School', 'Interview Confidence', 'Public Presentations', 'Long-term Goals', 'Personal Brand'] },
    { subject: 'Hygiene Development', topics: ['Adult Hygiene Habits', 'Workplace Cleanliness', 'Health Advocacy', 'Preventive Health', 'Wellness Planning'] },
    { subject: 'Communication', topics: ['Formal Speeches', 'Negotiation', 'Professional Email', 'Listening in Conflict', 'Storytelling for Impact'] },
    { subject: 'Leadership', topics: ['School Prefect Skills', 'Community Leadership', 'Mentorship', 'Legacy and Impact', 'Ethical Leadership'] },
    { subject: 'Teamwork', topics: ['Cross-school Projects', 'Volunteer Teams', 'Event Planning', 'Inclusive Teams', 'Sustainable Collaboration'] },
    { subject: 'Creativity', topics: ['Portfolio Building', 'Creative Careers', 'Social Innovation', 'Multimedia Projects', 'Legacy Projects'] },
  ],
};

const ANTHROPIC_MODEL = 'claude-sonnet-4-6';
const INPUT_COST_PER_M = 3;
const OUTPUT_COST_PER_M = 15;
const DELAY_MS = 500;

const SYSTEM_PROMPT = `You are an expert Nigerian primary school curriculum writer.
Write content strictly following the Nigerian NERDC curriculum.
Always use Nigerian examples, names, places, and currency (Naira).
Write at the appropriate level for the grade. Be detailed but simple enough for children to understand.`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUserPrompt(grade, subject, topic, language) {
  return `Write a complete lesson for:
Grade: ${grade}
Subject: ${subject}
Topic: ${topic}
Language: ${LANGUAGE_NAMES[language]}

Return ONLY a JSON object with exactly these fields:
{
  "content": "full lesson text (minimum 400 words, use Nigerian examples, clear explanations with examples, written for Primary ${grade} children)",
  "summary": "2-3 sentence summary",
  "learning_objectives": [
    "objective 1",
    "objective 2",
    "objective 3"
  ],
  "nigerian_examples": [
    "example 1",
    "example 2"
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
      "explanation": "why this is correct"
    },
    {
      "question_type": "multiple_choice",
      "question": "question text",
      "option_a": "option A",
      "option_b": "option B",
      "option_c": "option C",
      "option_d": "option D",
      "correct_answer": "B",
      "explanation": "why this is correct"
    },
    {
      "question_type": "multiple_choice",
      "question": "question text",
      "option_a": "option A",
      "option_b": "option B",
      "option_c": "option C",
      "option_d": "option D",
      "correct_answer": "C",
      "explanation": "why this is correct"
    },
    {
      "question_type": "true_false",
      "question": "statement to judge true or false",
      "option_a": "True",
      "option_b": "False",
      "option_c": null,
      "option_d": null,
      "correct_answer": "A",
      "explanation": "why this is true or false"
    },
    {
      "question_type": "true_false",
      "question": "statement to judge true or false",
      "option_a": "True",
      "option_b": "False",
      "option_c": null,
      "option_d": null,
      "correct_answer": "B",
      "explanation": "why this is false"
    }
  ]
}

Return ONLY the JSON. No markdown, no explanation, nothing else.`;
}

function parseJsonResponse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

function estimateCost(inputTokens, outputTokens) {
  return (inputTokens / 1_000_000) * INPUT_COST_PER_M + (outputTokens / 1_000_000) * OUTPUT_COST_PER_M;
}

async function lessonExists(supabase, grade, subject, topic, language) {
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

async function generateLesson(anthropic, grade, subject, topic, language) {
  const response = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(grade, subject, topic, language) }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || !textBlock.text) {
    throw new Error('Claude returned no text content');
  }

  const parsed = parseJsonResponse(textBlock.text);
  return {
    parsed,
    usage: {
      input_tokens: response.usage?.input_tokens ?? 0,
      output_tokens: response.usage?.output_tokens ?? 0,
    },
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
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing = [];
  if (!anthropicKey) missing.push('ANTHROPIC_API_KEY');
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  const anthropic = new Anthropic({ apiKey: anthropicKey });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let lessonsGenerated = 0;
  let quizQuestionsGenerated = 0;
  let skipped = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  const failures = [];

  console.log('Starting lesson generation...\n');

  for (let grade = 1; grade <= 6; grade += 1) {
    const subjects = SUBJECTS_BY_GRADE[grade];
    if (!subjects) continue;

    for (const { subject, topics } of subjects) {
      for (const topic of topics) {
        for (const language of LANGUAGES) {
          const label = `Grade ${grade} | ${subject} | ${topic} | ${language}`;

          try {
            const exists = await lessonExists(supabase, grade, subject, topic, language);
            if (exists) {
              skipped += 1;
              console.log(`⏭️  SKIP (exists): ${label}`);
              continue;
            }

            const { parsed, usage } = await generateLesson(anthropic, grade, subject, topic, language);
            totalInputTokens += usage.input_tokens;
            totalOutputTokens += usage.output_tokens;

            const quizCount = await saveLesson(supabase, grade, subject, topic, language, parsed);
            lessonsGenerated += 1;
            quizQuestionsGenerated += quizCount;

            console.log(`✅ ${label}`);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            failures.push({ label, error: message });
            console.log(`❌ FAILED: ${label} | ${message}`);
          }

          await sleep(DELAY_MS);
        }
      }
    }
  }

  const estimatedCost = estimateCost(totalInputTokens, totalOutputTokens);

  console.log('\n─────────────────────────────────────────');
  console.log('SUMMARY');
  console.log('─────────────────────────────────────────');
  console.log(`Total lessons generated: ${lessonsGenerated}`);
  console.log(`Total quiz questions generated: ${quizQuestionsGenerated}`);
  console.log(`Skipped (already existed): ${skipped}`);
  console.log(`Failed: ${failures.length}`);
  if (failures.length > 0) {
    for (const f of failures) {
      console.log(`  - ${f.label}: ${f.error}`);
    }
  }
  console.log(`Estimated cost: $${estimatedCost.toFixed(2)}`);
  console.log(`Tokens used: ${totalInputTokens} input / ${totalOutputTokens} output`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
