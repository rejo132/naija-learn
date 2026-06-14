const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data: lessons } = await supabase
    .from('lessons')
    .select('grade, subject, topic')
    .eq('language', 'en')
    .order('grade')
    .order('subject');
  
  const byGrade = {};
  lessons.forEach(l => {
    if (!byGrade[l.grade]) byGrade[l.grade] = {};
    if (!byGrade[l.grade][l.subject]) byGrade[l.grade][l.subject] = [];
    byGrade[l.grade][l.subject].push(l.topic);
  });
  
  console.log('=== CURRENT LESSONS IN SUPABASE ===\n');
  for (let grade = 1; grade <= 6; grade++) {
    if (!byGrade[grade]) {
      console.log('Grade ' + grade + ': NO LESSONS');
      continue;
    }
    console.log('Grade ' + grade + ':');
    const subjects = Object.keys(byGrade[grade]).sort();
    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i];
      const topics = byGrade[grade][subject];
      console.log('  ' + subject + ': ' + topics.length + ' topics');
      for (let j = 0; j < topics.length; j++) {
        console.log('    - ' + topics[j]);
      }
    }
    console.log('');
  }
  
  const total = lessons.length;
  console.log('TOTAL LESSONS: ' + total);
})();
