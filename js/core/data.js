import { getConfig } from '../utils/config-loader.js';

export function collectLessonData() {
  const get = (id) => document.getElementById(id)?.value?.trim() || '';

  const data = {
    subject: get('subject'),
    grade: get('grade'),
    class: get('class'),
    academicYear: get('academic-year'),
    teacher: get('teacher'),
    lessonTopic: get('lesson-topic'),
    prepareTime: get('prepare-time'),
    classHours: get('class-hours'),
    curriculumRequire: get('curriculum-require'),
    literacyTarget: get('literacy-target'),
    keyPoints: get('key-points'),
    difficultPoints: get('difficult-points'),
    studentAnalysis: get('student-analysis'),
    teachingStrategy: get('teaching-strategy'),
    teachingResources: get('teaching-resources'),
    teachingProcess: collectTeachingProcess(),
    blackboardDesign: get('blackboard-design'),
    reflection: get('teaching-reflection'),
  };
  return data;
}

function collectTeachingProcess() {
  const rows = [];
  const tbody = document.querySelector('#lesson table tbody');
  if (!tbody) return rows;

  tbody.querySelectorAll('tr').forEach(row => {
    const textareas = row.querySelectorAll('textarea');
    if (textareas.length >= 3) {
      const teacherActivity = textareas[0].value.trim();
      const studentActivity = textareas[1].value.trim();
      const designIntent = textareas[2].value.trim();
      if (teacherActivity || studentActivity || designIntent) {
        rows.push({ teacherActivity, studentActivity, designIntent });
      }
    }
  });
  return rows;
}

export function exportToJSON() {
  const data = collectLessonData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `教案数据_${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        Object.keys(data).forEach(key => {
          const el = document.getElementById(key);
          if (el) {
            el.value = data[key];
          }
        });
        alert('数据导入成功！');
      } catch {
        alert('数据导入失败，请确保文件格式正确。');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
