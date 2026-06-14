const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const samples = [
    { grade: 1, subject: 'English Studies', topic: 'Nouns and Action Words' },
    { grade: 2, subject: 'Mathematics', topic: 'Money and Prices' },
    { grade: 3, subject: 'Basic Science & Technology', topic: 'Food Chains' },
    { grade: 4, subject: 'Nigerian History', topic: 'Benin Kingdom' },
    { grade: 5, subject: 'CRS / Islamic Studies', topic: 'Interfaith Dialogue' },
    { grade: 6, subject: 'Physical & Health Education', topic: 'Health Policy and Advocacy' }
  ];
  
  console.log('=== QUALITY CHECK - RANDOM SAMPLES ===\n');
  
  for (const sample of samples) {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('topic, summary, content, learning_objectives, nigerian_examples, quiz_questions')
      .eq('grade', sample.grade)
      .eq('subject', sample.subject)
      .eq('topic', sample.topic)
      .eq('language', 'en');
    
    if (lessons && lessons.length > 0) {
      const lesson = lessons[0];
      console.log('✅ Grade ' + sample.grade + ' | ' + sample.subject + ' | ' + sample.topic);
      console.log('   Summary: ' + (lesson.summary ? lesson.summary.substring(0, 100) : 'N/A') + '...');
      console.log('   Learning Objectives: ' + (lesson.learning_objectives ? lesson.learning_objectives.length : 0));
      console.log('   Nigerian Examples: ' + (lesson.nigerian_examples ? lesson.nigerian_examples.length : 0));
      console.log('   Quiz Questions: ' + (lesson.quiz_questions ? lesson.quiz_questions.length : 0));
      console.log('');
    } else {
      console.log('❌ Grade ' + sample.grade + ' | ' + sample.subject + ' | ' + sample.topic + ' - NOT FOUND');
      console.log('');
    }
  }
  
  const { data: all } = await supabase
    .from('lessons')
    .select('grade', { count: 'exact' });
  
  const gradeCounts = {};
  for (const l of all) {
    gradeCounts[l.grade] = (gradeCounts[l.grade] || 0) + 1;
  }
  
  console.log('=== FINAL COUNTS ===');
  let total = 0;
  for (let g = 1; g <= 6; g++) {
    console.log('Grade ' + g + ': ' + (gradeCounts[g] || 0) + ' lessons');
    total += (gradeCounts[g] || 0);
  }
  console.log('TOTAL: ' + total + ' lessons');
})();
