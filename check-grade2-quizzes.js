const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const subjects = [
  'English Studies',
  'Mathematics', 
  'Basic Science & Technology',
  'Physical & Health Education',
  'CRS / Islamic Studies',
  'Nigerian History',
  'Social & Citizenship Studies',
  'Cultural & Creative Arts'
];

async function checkQuizzes() {
  console.log('Checking Grade 2 quizzes...\n');
  
  for (const subject of subjects) {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, topic')
      .eq('grade', 2)
      .eq('subject', subject)
      .eq('language', 'en');
    
    if (!lessons || lessons.length === 0) {
      console.log(`${subject}: NO LESSONS FOUND`);
      continue;
    }
    
    console.log(`\n${subject}:`);
    let totalQuizzes = 0;
    for (const lesson of lessons) {
      const { count } = await supabase
        .from('quiz_questions')
        .select('id', { count: 'exact', head: true })
        .eq('lesson_id', lesson.id);
      totalQuizzes += count;
      console.log(`  ${lesson.topic}: ${count} quiz questions`);
    }
    console.log(`  TOTAL: ${totalQuizzes} quizzes for ${lessons.length} lessons`);
  }
}

checkQuizzes();
