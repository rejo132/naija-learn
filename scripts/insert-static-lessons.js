/**
 * Insert pre-written lessons from static-lessons.json into Supabase,
 * then translate to Hausa, Yoruba, and Igbo via MyMemory.
 * Run: npm run insert-static
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const CALL_DELAY_MS = 1000;
const TRANSLATE_DELAY_MS = 500;
const TRANSLATION_LANGUAGES = ['ha', 'yo', 'ig'];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateLessonPayload(parsed) {
  if (!parsed.content || !parsed.summary) {
    throw new Error('Lesson missing content or summary');
  }
  if (!Array.isArray(parsed.learning_objectives) || parsed.learning_objectives.length === 0) {
    throw new Error('Lesson missing learning_objectives');
  }
  if (!Array.isArray(parsed.nigerian_examples)) {
    throw new Error('Lesson missing nigerian_examples');
  }
  if (!Array.isArray(parsed.quiz_questions) || parsed.quiz_questions.length === 0) {
    throw new Error('Lesson missing quiz_questions');
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
    question_type: 'multiple_choice',
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

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  const staticPath = path.resolve(__dirname, '../static-lessons.json');
  if (!fs.existsSync(staticPath)) {
    console.error(`Missing static-lessons.json at ${staticPath}`);
    process.exit(1);
  }

  const lessons = JSON.parse(fs.readFileSync(staticPath, 'utf8'));
  if (!Array.isArray(lessons)) {
    console.error('static-lessons.json must be an array of lesson objects');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let lessonsGenerated = 0;
  let quizQuestionsGenerated = 0;
  let failed = 0;

  console.log(`Starting static lesson insert (${lessons.length} lessons)...\n`);

  for (const entry of lessons) {
    const { grade, subject, topic } = entry;
    const label = `Grade ${grade} | ${subject} | ${topic}`;

    try {
      const exists = await lessonExists(supabase, grade, subject, topic, 'en');
      if (exists) {
        console.log(`⏭️  SKIP (exists): ${label}`);
        continue;
      }

      validateLessonPayload(entry);

      const englishQuizCount = await saveLesson(
        supabase,
        grade,
        subject,
        topic,
        'en',
        entry
      );
      lessonsGenerated += 1;
      quizQuestionsGenerated += englishQuizCount;

      for (const lang of TRANSLATION_LANGUAGES) {
        const translatedParsed = await translateLesson(entry, lang);
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
      console.log(`❌ FAILED: ${label} | ${message}`);
    }

    await sleep(CALL_DELAY_MS);
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
