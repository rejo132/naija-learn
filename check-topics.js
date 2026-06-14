const fs = require('fs');
const content = fs.readFileSync('scripts/generate-lessons.js', 'utf8');
const match = content.match(/SUBJECTS_BY_GRADE\s*=\s*(\{[\s\S]*?\n\};)/);
eval('var SUBJECTS_BY_GRADE = ' + match[1].replace(/;$/, ''));

const supabase_data = JSON.parse(fs.readFileSync('supabase-topics.json', 'utf8'));

const report = {};
for (const grade of [1, 2, 3, 4, 5, 6]) {
  report[grade] = { correct: [], missing: [], wrong: [] };
  const expected = SUBJECTS_BY_GRADE[grade] || [];

  expected.forEach(({ subject, topics }) => {
    topics.forEach(topic => {
      const found = supabase_data.find(l =>
        l.grade === grade && l.subject === subject && l.topic === topic
      );
      if (found) report[grade].correct.push(subject + ' | ' + topic);
      else report[grade].missing.push(subject + ' | ' + topic);
    });
  });

  supabase_data.filter(l => l.grade === grade).forEach(l => {
    const gradeSubjects = SUBJECTS_BY_GRADE[grade] || [];
    const subjectEntry = gradeSubjects.find(s => s.subject === l.subject);
    const isWrong = !subjectEntry || !subjectEntry.topics.includes(l.topic);
    if (isWrong) {
      report[grade].wrong.push(l.subject + ' | ' + l.topic);
    }
  });
}

for (const grade of [1, 2, 3, 4, 5, 6]) {
  const r = report[grade];
  console.log('GRADE ' + grade + ' - Correct: ' + r.correct.length + ' | Missing: ' + r.missing.length + ' | Wrong: ' + r.wrong.length);
  if (r.missing.length) {
    console.log('  MISSING:');
    r.missing.forEach(m => console.log('    -', m));
  }
  if (r.wrong.length) {
    console.log('  WRONG (in DB but not in curriculum):');
    r.wrong.slice(0, 10).forEach(w => console.log('    -', w));
    if (r.wrong.length > 10) console.log('    ...+' + (r.wrong.length - 10) + ' more');
  }
}

fs.writeFileSync('topic-report.json', JSON.stringify(report, null, 2));
console.log('\nFull report saved to topic-report.json');
