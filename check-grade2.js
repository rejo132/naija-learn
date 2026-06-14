const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data: lessons } = await supabase
    .from('lessons')
    .select('subject')
    .eq('grade', 2)
    .eq('language', 'en');
  
  const counts = {};
  lessons.forEach(l => {
    counts[l.subject] = (counts[l.subject] || 0) + 1;
  });
  
  console.log('Grade 2 Complete Summary:');
  Object.entries(counts).sort().forEach(([s, c]) => {
    console.log(`  ${s}: ${c} lessons`);
  });
  
  console.log(`\nTotal lessons: ${lessons.length}`);
  const expected = 15 * 5;
  console.log(`Expected: ${expected} lessons (15 subjects x 5 topics)`);
  
  if (lessons.length === expected) {
    console.log('✅ GRADE 2 COMPLETE!');
  } else {
    console.log(`⚠️ Still missing ${expected - lessons.length} lessons`);
  }
})();
