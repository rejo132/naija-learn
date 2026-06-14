/**
 * Backfill quiz_questions for existing English lessons from static-lessons.json.
 * Run: npm run insert-quiz
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const CALL_DELAY_MS = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findLesson(supabase, grade, subject, topic, language = 'en') {
  const { data, error } = await supabase
    .from('lessons')
    .select('id')
    .eq('grade', grade)
    .eq('subject', subject)
    .eq('topic', topic)
    .eq('language', language)
    .maybeSingle();

  if (error) throw new Error(`Supabase check failed: ${error.message}`);
  return data;
}

async function quizCountForLesson(supabase, lessonId) {
  const { count, error } = await supabase
    .from('quiz_questions')
    .select('*', { count: 'exact', head: true })
    .eq('lesson_id', lessonId);

  if (error) throw new Error(`Quiz count failed: ${error.message}`);
  return count ?? 0;
}

async function insertQuizQuestions(supabase, lessonId, grade, subject, topic, quizQuestions) {
  const quizRows = quizQuestions.map((q) => ({
    lesson_id: lessonId,
    grade,
    subject,
    topic,
    language: 'en',
    question_type: 'multiple_choice',
    question: q.question,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
  }));

  const { error } = await supabase.from('quiz_questions').insert(quizRows);
  if (error) throw new Error(`Quiz insert failed: ${error.message}`);

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

  let inserted = 0;
  let quizQuestionsGenerated = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Starting quiz backfill (${lessons.length} lessons)...\n`);

  for (const entry of lessons) {
    const { grade, subject, topic } = entry;
    const label = `Grade ${grade} | ${subject} | ${topic}`;

    try {
      if (!Array.isArray(entry.quiz_questions) || entry.quiz_questions.length === 0) {
        throw new Error('Lesson missing quiz_questions');
      }

      const lesson = await findLesson(supabase, grade, subject, topic, 'en');
      if (!lesson) {
        throw new Error('English lesson not found in Supabase');
      }

      const existingCount = await quizCountForLesson(supabase, lesson.id);
      if (existingCount > 0) {
        skipped += 1;
        console.log(`⏭️  SKIP (has quiz): ${label}`);
        continue;
      }

      const count = await insertQuizQuestions(
        supabase,
        lesson.id,
        grade,
        subject,
        topic,
        entry.quiz_questions
      );
      inserted += 1;
      quizQuestionsGenerated += count;
      console.log(`✅ ${label}`);
    } catch (err) {
      failed += 1;
      const message = err instanceof Error ? err.message : String(err);
      console.log(`❌ FAILED: ${label} | ${message}`);
    }

    await sleep(CALL_DELAY_MS);
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`Lessons backfilled: ${inserted}`);
  console.log(`Skipped (has quiz): ${skipped}`);
  console.log(`Total quiz questions generated: ${quizQuestionsGenerated}`);
  console.log(`Failed: ${failed}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
