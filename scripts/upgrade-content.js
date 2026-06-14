/**
 * Upgrade short Supabase lesson content using richer static JSON files
 * from static-lessons/grade-2 through grade-6.
 * Run: npm run upgrade-content
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const MIN_CONTENT_CHARS = 800;
const GRADE_DIRS = [2, 3, 4, 5, 6].map((g) =>
  path.resolve(__dirname, `../static-lessons/grade-${g}`)
);

function isLessonObject(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.grade === 'number' &&
    typeof obj.subject === 'string' &&
    typeof obj.topic === 'string' &&
    typeof obj.content === 'string'
  );
}

function extractLessonsFromParsed(parsed) {
  if (Array.isArray(parsed)) {
    return parsed.filter(isLessonObject);
  }
  if (isLessonObject(parsed)) {
    return [parsed];
  }
  return [];
}

function collectLessonsFromFiles() {
  const lessons = [];

  for (const dir of GRADE_DIRS) {
    if (!fs.existsSync(dir)) {
      console.warn(`⚠️  Directory not found: ${dir}`);
      continue;
    }

    const files = fs
      .readdirSync(dir)
      .filter((name) => name.endsWith('.json'))
      .sort();

    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const extracted = extractLessonsFromParsed(parsed);
        lessons.push(...extracted);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`⚠️  SKIP FILE (parse error): ${filePath} — ${message}`);
      }
    }
  }

  return lessons;
}

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function convertQuizQuestion(q, grade, subject, topic) {
  if (q.option_a !== undefined || q.option_b !== undefined) {
    const options = [q.option_a, q.option_b, q.option_c, q.option_d].filter(
      (value) => value != null && value !== ''
    );
    const question_type =
      q.question_type ||
      (options.length <= 2 ? 'true_false' : 'multiple_choice');

    return {
      grade,
      subject,
      topic,
      language: 'en',
      question_type,
      question: q.question,
      option_a: q.option_a ?? null,
      option_b: q.option_b ?? null,
      option_c: q.option_c ?? null,
      option_d: q.option_d ?? null,
      correct_answer: String(q.correct_answer ?? '').trim().toUpperCase(),
      explanation: q.explanation ?? '',
    };
  }

  const options = Array.isArray(q.options) ? q.options : [];
  const option_a = options[0] ?? null;
  const option_b = options[1] ?? null;
  const option_c = options[2] ?? null;
  const option_d = options[3] ?? null;
  const filledCount = [option_a, option_b, option_c, option_d].filter(
    (value) => value != null && value !== ''
  ).length;
  const question_type = filledCount <= 2 ? 'true_false' : 'multiple_choice';

  const letters = ['A', 'B', 'C', 'D'];
  const opts = [option_a, option_b, option_c, option_d];
  let correct_answer = String(q.correct_answer ?? '').trim();

  if (!letters.includes(correct_answer.toUpperCase())) {
    const target = normalizeText(correct_answer);
    const idx = opts.findIndex((opt) => normalizeText(opt) === target);
    if (idx >= 0) {
      correct_answer = letters[idx];
    }
  } else {
    correct_answer = correct_answer.toUpperCase();
  }

  return {
    grade,
    subject,
    topic,
    language: 'en',
    question_type,
    question: q.question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    explanation: q.explanation ?? '',
  };
}

async function findEnglishLesson(supabase, grade, subject, topic) {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, content')
    .eq('grade', grade)
    .eq('subject', subject)
    .eq('topic', topic)
    .eq('language', 'en')
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase lookup failed: ${error.message}`);
  }

  return data;
}

async function upgradeLesson(supabase, lessonId, lesson, quizRows) {
  const { error: updateError } = await supabase
    .from('lessons')
    .update({
      content: lesson.content,
      summary: lesson.summary,
      learning_objectives: lesson.learning_objectives,
      nigerian_examples: lesson.nigerian_examples,
    })
    .eq('id', lessonId);

  if (updateError) {
    throw new Error(`Lesson update failed: ${updateError.message}`);
  }

  const { error: deleteError } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('lesson_id', lessonId);

  if (deleteError) {
    throw new Error(`Quiz delete failed: ${deleteError.message}`);
  }

  if (quizRows.length > 0) {
    const rows = quizRows.map((row) => ({
      ...row,
      lesson_id: lessonId,
    }));

    const { error: insertError } = await supabase
      .from('quiz_questions')
      .insert(rows);

    if (insertError) {
      throw new Error(`Quiz insert failed: ${insertError.message}`);
    }
  }
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

  const lessons = collectLessonsFromFiles();
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let upgraded = 0;
  let skipped = 0;
  let noMatch = 0;
  let shortSource = 0;
  let failed = 0;

  console.log(`Scanning static lessons (grades 2-6)...`);
  console.log(`Found ${lessons.length} lesson object(s) in JSON files.\n`);

  for (const lesson of lessons) {
    const label = `Grade ${lesson.grade} | ${lesson.subject} | ${lesson.topic}`;
    const sourceLength = lesson.content?.length ?? 0;

    if (sourceLength <= MIN_CONTENT_CHARS) {
      shortSource += 1;
      console.log(`❌ SHORT SOURCE: ${label} (${sourceLength} chars)`);
      continue;
    }

    try {
      const existing = await findEnglishLesson(
        supabase,
        lesson.grade,
        lesson.subject,
        lesson.topic
      );

      if (!existing) {
        noMatch += 1;
        console.log(`⚠️  NO MATCH: ${label}`);
        continue;
      }

      const existingLength = existing.content?.length ?? 0;

      if (existingLength >= MIN_CONTENT_CHARS) {
        skipped += 1;
        console.log(
          `⏭️  SKIP (already good): ${label} (${existingLength} chars)`
        );
        continue;
      }

      const quizQuestions = Array.isArray(lesson.quiz_questions)
        ? lesson.quiz_questions
        : [];
      const quizRows = quizQuestions.map((q) =>
        convertQuizQuestion(q, lesson.grade, lesson.subject, lesson.topic)
      );

      await upgradeLesson(supabase, existing.id, lesson, quizRows);
      upgraded += 1;
      console.log(
        `✅ UPGRADED ${label} (${existingLength} → ${sourceLength} chars)`
      );
    } catch (err) {
      failed += 1;
      const message = err instanceof Error ? err.message : String(err);
      console.log(`❌ FAILED: ${label} — ${message}`);
    }
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`Total lessons scanned from files: ${lessons.length}`);
  console.log(`Upgraded: ${upgraded}`);
  console.log(`Skipped (already good): ${skipped}`);
  console.log(`No match: ${noMatch}`);
  console.log(`Short source: ${shortSource}`);
  if (failed > 0) {
    console.log(`Failed: ${failed}`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
