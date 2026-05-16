import { callDeepSeekAPI } from './api.js';
import { getConfig } from '../utils/config-loader.js';

const CONFIG = getConfig();

export function init() {
  const generateBtn = document.getElementById('ai-generate-btn');
  const clearBtn = document.getElementById('clear-all-btn');

  if (generateBtn) {
    generateBtn.addEventListener('click', () => generateLessonPlan());
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('确定要清空所有教案内容吗？此操作不可恢复。')) {
        clearAllLessonContent();
      }
    });
  }
}

async function generateLessonPlan() {
  const apiKeyInput = document.getElementById('api-key');
  const loadingIndicator = document.getElementById('loading-indicator');
  const generateBtn = document.getElementById('ai-generate-btn');

  const coverData = {
    subject: document.getElementById('subject')?.value?.trim() || '',
    grade: document.getElementById('grade')?.value?.trim() || '',
    class: document.getElementById('class')?.value?.trim() || '',
    academicYear: document.getElementById('academic-year')?.value?.trim() || '',
    teacher: document.getElementById('teacher')?.value?.trim() || '',
    lessonTopic: document.getElementById('lesson-topic')?.value?.trim() || '',
  };

  const missing = [];
  if (!coverData.subject) missing.push('学科');
  if (!coverData.grade) missing.push('年级');
  if (missing.length > 0) {
    alert(`请先在封面区域填写：${missing.join('、')}`);
    document.getElementById('cover')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  if (!coverData.lessonTopic) {
    const ok = confirm('未填写课题，是否继续生成通用教案？\n\n点击"确定"生成通用教案模板。');
    if (!ok) {
      document.getElementById('lesson')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    coverData.lessonTopic = `${coverData.subject}${CONFIG.DEFAULT_TOPIC_PREFIX}`;
  }

  const apiKey = apiKeyInput?.value?.trim();
  if (!apiKey) {
    alert('请输入 API 密钥！');
    return;
  }

  generateBtn.disabled = true;
  if (loadingIndicator) loadingIndicator.style.display = 'flex';

  try {
    const content = await callDeepSeekAPI(apiKey, coverData);
    fillContent(content);
    alert('教案生成成功！');
    document.getElementById('lesson')?.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('生成失败:', error);
    alert('教案生成失败，请检查 API 密钥或稍后重试。\n' + error.message);
  } finally {
    generateBtn.disabled = false;
    if (loadingIndicator) loadingIndicator.style.display = 'none';
  }
}

function fillContent(content) {
  const setField = (id, value) => {
    const el = document.getElementById(id);
    if (el && value) {
      el.value = value;
    }
  };

  setField('curriculum-require', content.curriculumRequire);
  setField('literacy-target', content.literacyTarget);
  setField('key-points', content.keyPoints);
  setField('difficult-points', content.difficultPoints);
  setField('student-analysis', content.studentAnalysis);
  setField('teaching-strategy', content.teachingStrategy);
  setField('teaching-resources', content.teachingResources);
  setField('blackboard-design', content.blackboardDesign);
  setField('teaching-reflection', content.reflection);

  if (content.teachingProcess && Array.isArray(content.teachingProcess)) {
    const tbody = document.querySelector('#lesson table tbody');
    if (tbody) {
      const rows = tbody.querySelectorAll('tr');
      content.teachingProcess.forEach((process, index) => {
        if (index < rows.length) {
          const tas = rows[index].querySelectorAll('textarea');
          if (tas[0]) tas[0].value = process.teacherActivity || '';
          if (tas[1]) tas[1].value = process.studentActivity || '';
          if (tas[2]) tas[2].value = process.designIntent || '';
        }
      });
    }
  }
}

function clearAllLessonContent() {
  document.querySelectorAll('input[type="text"], textarea').forEach(input => {
    if (input.id !== 'api-key') {
      input.value = '';
    }
  });
  const tbody = document.querySelector('#lesson table tbody');
  if (tbody) {
    tbody.querySelectorAll('tr').forEach(row => {
      row.querySelectorAll('textarea').forEach(ta => { ta.value = ''; });
    });
  }
}
