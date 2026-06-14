const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  console.log('📦 Exporting all lessons from Supabase...\n');
  
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('language', 'en')
    .order('grade')
    .order('subject')
    .order('topic');
  
  if (error) {
    console.error('Export error:', error);
    return;
  }
  
  console.log(`✅ Found ${lessons.length} lessons to export.\n`);
  
  // Create backup directory if not exists
  if (!fs.existsSync('lesson-backup')) {
    fs.mkdirSync('lesson-backup');
  }
  
  // Group by grade
  const byGrade = {};
  for (const lesson of lessons) {
    if (!byGrade[lesson.grade]) byGrade[lesson.grade] = [];
    byGrade[lesson.grade].push(lesson);
  }
  
  // Save individual grade files
  for (let grade = 1; grade <= 6; grade++) {
    if (byGrade[grade]) {
      const filename = `lesson-backup/grade-${grade}-lessons.json`;
      fs.writeFileSync(filename, JSON.stringify(byGrade[grade], null, 2));
      console.log(`📁 Saved: ${filename} (${byGrade[grade].length} lessons)`);
    }
  }
  
  // Save master backup
  const timestamp = Date.now();
  const masterFile = `lesson-backup/all-grades-master-backup-${timestamp}.json`;
  fs.writeFileSync(masterFile, JSON.stringify(lessons, null, 2));
  console.log(`\n📦 Saved master backup: ${masterFile}`);
  
  // Create summary report
  let totalQuizQuestions = 0;
  for (const lesson of lessons) {
    if (lesson.quiz_questions && Array.isArray(lesson.quiz_questions)) {
      totalQuizQuestions += lesson.quiz_questions.length;
    }
  }
  
  const summary = {
    exportDate: new Date().toISOString(),
    totalLessons: lessons.length,
    totalQuizQuestions: totalQuizQuestions,
    byGrade: {}
  };
  
  for (let grade = 1; grade <= 6; grade++) {
    const gradeLessons = lessons.filter(l => l.grade === grade);
    const subjects = {};
    for (const l of gradeLessons) {
      subjects[l.subject] = (subjects[l.subject] || 0) + 1;
    }
    summary.byGrade[grade] = {
      count: gradeLessons.length,
      subjects: subjects
    };
  }
  
  fs.writeFileSync('lesson-backup/backup-summary.json', JSON.stringify(summary, null, 2));
  console.log('📋 Saved backup summary: lesson-backup/backup-summary.json');
  
  // Print summary
  console.log('\n=== BACKUP SUMMARY ===');
  console.log(`📚 Total Lessons: ${summary.totalLessons}`);
  console.log(`❓ Total Quiz Questions: ${summary.totalQuizQuestions}`);
  console.log('📊 By Grade:');
  for (let grade = 1; grade <= 6; grade++) {
    console.log(`   Grade ${grade}: ${summary.byGrade[grade]?.count || 0} lessons`);
  }
  
  console.log('\n✅ Backup completed successfully!');
  console.log('📁 Files saved in lesson-backup/ folder');
})();
