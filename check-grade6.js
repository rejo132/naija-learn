const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data: lessons } = await supabase
    .from('lessons')
    .select('subject, topic')
    .eq('grade', 6)
    .eq('language', 'en')
    .order('subject');
  
  const subjects = {};
  for (const l of lessons) {
    if (!subjects[l.subject]) subjects[l.subject] = [];
    subjects[l.subject].push(l.topic);
  }
  
  console.log('=== GRADE 6 LESSONS ===\n');
  for (const subject of Object.keys(subjects).sort()) {
    const topics = subjects[subject];
    console.log(subject + ': ' + topics.length + ' topics');
    for (const t of topics) {
      console.log('  - ' + t);
    }
  }
  console.log('\nTOTAL LESSONS: ' + lessons.length + ' / 75 expected');
  console.log('Missing: ' + (75 - lessons.length) + ' lessons');
})();
