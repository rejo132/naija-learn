const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const subjects = ['English Studies', 'Mathematics', 'Basic Science & Technology', 'Nigerian History', 'CRS / Islamic Studies', 'Physical & Health Education'];
  
  for (const subject of subjects) {
    console.log('\n=== ' + subject + ' ===');
    for (let grade = 1; grade <= 4; grade++) {
      const { data: lessons } = await supabase
        .from('lessons')
        .select('topic')
        .eq('grade', grade)
        .eq('subject', subject)
        .eq('language', 'en');
      
      if (lessons && lessons.length > 0) {
        console.log('Grade ' + grade + ':');
        lessons.forEach(l => console.log('  - ' + l.topic));
      }
    }
  }
  
  // Also check what's in Grade 5 and 6
  console.log('\n=== CHECKING GRADES 5-6 ===');
  for (let grade = 5; grade <= 6; grade++) {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('subject, topic')
      .eq('grade', grade)
      .eq('language', 'en')
      .limit(10);
    
    if (lessons && lessons.length > 0) {
      console.log('Grade ' + grade + ' samples:');
      lessons.forEach(l => console.log('  ' + l.subject + ': ' + l.topic));
    } else {
      console.log('Grade ' + grade + ': No lessons found');
    }
  }
})();
