const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const fs = require('fs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const content = fs.readFileSync('scripts/generate-lessons.js', 'utf8');
  const match = content.match(/SUBJECTS_BY_GRADE\s*=\s*(\{[\s\S]*?\n\};)/);
  eval('var SUBJECTS_BY_GRADE = ' + match[1].replace(/;$/, ''));

  const { data: allLessons, error } = await supabase
    .from('lessons').select('id, grade, subject, topic, language').eq('language', 'en');

  if (error) { console.error('Fetch error:', error); return; }

  const toDelete = [];
  allLessons.forEach(l => {
    const gradeSubjects = SUBJECTS_BY_GRADE[l.grade] || [];
    const subjectEntry = gradeSubjects.find(s => s.subject === l.subject);
    const isWrong = !subjectEntry || !subjectEntry.topics.includes(l.topic);
    if (isWrong) toDelete.push({ id: l.id, grade: l.grade, subject: l.subject, topic: l.topic });
  });

  console.log('Wrong lessons to delete:', toDelete.length);
  toDelete.forEach(l => console.log(' -', l.grade, '|', l.subject, '|', l.topic));

  if (toDelete.length === 0) { console.log('Nothing to delete.'); return; }

  const ids = toDelete.map(l => l.id);
  let deleted = 0;
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const { error: delError } = await supabase.from('lessons').delete().in('id', batch);
    if (delError) console.error('Delete error:', delError);
    else deleted += batch.length;
  }
  console.log('Deleted', deleted, 'wrong lessons');
}

main();
