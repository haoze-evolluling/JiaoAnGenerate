# LessonCraft-AI 项目重构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构厦门九中教案本项目，解决 API 密钥硬编码、代码结构混乱、教学环节不可扩展的问题

**Architecture:** 采用 ES Module 替代全局 script，按职责拆分模块。API 密钥通过 XOR + Base64 加密存储（密钥存 sessionStorage）。教学环节支持动态增删行。配置文件通过 config.js（gitignore）管理。

**Tech Stack:** 原生 ES Module（Vanilla JS），无构建工具

---

### Task 1: 创建项目基础设施

**Files:**
- Create: `config.js`
- Create: `config.example.js`
- Create: `.gitignore`
- Create: `js/utils/`
- Create: `js/core/`
- Create: `js/ai/`
- Create: `js/pdf/`
- Create: `js/ui/`

- [ ] **Step 1: 创建 config.js**

```js
export const CONFIG = {
  API_BASE_URL: 'https://api.deepseek.com/v1',
  API_MODEL: 'deepseek-chat',
  API_TEMPERATURE: 0.7,
  API_MAX_TOKENS: 4000,
  DEFAULT_TOPIC_PREFIX: '教学',
  STORAGE_PREFIX: 'lessonPlan_',
};
```

- [ ] **Step 2: 创建 config.example.js**

```js
export const CONFIG = {
  API_BASE_URL: 'https://api.deepseek.com/v1',
  API_MODEL: 'deepseek-chat',
  API_TEMPERATURE: 0.7,
  API_MAX_TOKENS: 4000,
  DEFAULT_TOPIC_PREFIX: '教学',
  STORAGE_PREFIX: 'lessonPlan_',
};
```

- [ ] **Step 3: 创建 .gitignore**

```
config.js
```

- [ ] **Step 4: 创建模块目录**

```bash
mkdir -p js/utils js/core js/ai js/pdf js/ui
```

- [ ] **Step 5: 提交**

```bash
git add config.js config.example.js .gitignore js/
git commit -m "chore: 创建项目基础设施和模块目录"
```

---

### Task 2: 创建 XOR 加密工具模块 (crypto.js)

**Files:**
- Create: `js/utils/crypto.js`

- [ ] **Step 1: 创建 crypto.js**

```js
/**
 * XOR 混淆 + Base64 编解码工具
 * 密钥存于 sessionStorage，关闭标签页即销毁
 * 注意：这是轻量混淆，非真正加密
 */

export function generateKey(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < length; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export function encrypt(text, key) {
  if (!text) return '';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(encodeURIComponent(result));
}

export function decrypt(encoded, key) {
  if (!encoded) return '';
  try {
    const decoded = decodeURIComponent(atob(encoded));
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch {
    return '';
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add js/utils/crypto.js
git commit -m "feat: 添加 XOR 混淆加密工具模块"
```

---

### Task 3: 创建配置加载模块 (config-loader.js)

**Files:**
- Create: `js/utils/config-loader.js`

- [ ] **Step 1: 创建 config-loader.js**

```js
import { CONFIG } from '../../config.js';

// 提供默认值兜底，防止 config.js 缺失
const DEFAULTS = {
  API_BASE_URL: 'https://api.deepseek.com/v1',
  API_MODEL: 'deepseek-chat',
  API_TEMPERATURE: 0.7,
  API_MAX_TOKENS: 4000,
  DEFAULT_TOPIC_PREFIX: '教学',
  STORAGE_PREFIX: 'lessonPlan_',
};

export function getConfig() {
  return { ...DEFAULTS, ...CONFIG };
}
```

- [ ] **Step 2: 提交**

```bash
git add js/utils/config-loader.js
git commit -m "feat: 添加配置加载模块"
```

---

### Task 4: 创建 navigation 模块

**Files:**
- Create: `js/core/navigation.js`

- [ ] **Step 1: 创建 navigation.js**

```js
export function init() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.pageYOffset >= sectionTop - 100) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });

  // 平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const nav = document.querySelector('nav');
        const navHeight = nav ? nav.offsetHeight : 0;
        window.scrollTo({ top: target.offsetTop - navHeight, behavior: 'smooth' });
      }
    });
  });
}
```

- [ ] **Step 2: 提交**

```bash
git add js/core/navigation.js
git commit -m "feat: 创建导航模块"
```

---

### Task 5: 创建 date 模块

**Files:**
- Create: `js/core/date.js`

- [ ] **Step 1: 创建 date.js**

```js
export function init() {
  const dateElement = document.querySelector('.cover .text-lg p');
  if (!dateElement) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekday = weekdays[now.getDay()];

  dateElement.textContent = `当前日期：${year}年${month}月${day}日 ${weekday}`;
}
```

- [ ] **Step 2: 提交**

```bash
git add js/core/date.js
git commit -m "feat: 创建日期显示模块"
```

---

### Task 6: 创建 data.js（数据收集与导入导出）

**Files:**
- Create: `js/core/data.js`

- [ ] **Step 1: 创建 data.js**

```js
import { getConfig } from '../utils/config-loader.js';

export function collectLessonData() {
  const get = (id) => document.getElementById(id)?.value?.trim() || '';

  const data = {
    // 封面
    subject: get('subject'),
    grade: get('grade'),
    class: get('class'),
    academicYear: get('academic-year'),
    teacher: get('teacher'),
    // 备课信息
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
    // 教学过程（动态行）
    teachingProcess: collectTeachingProcess(),
    // 板书与反思
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
```

- [ ] **Step 2: 提交**

```bash
git add js/core/data.js
git commit -m "feat: 创建数据收集与导入导出模块"
```

---

### Task 7: 创建 persistence 模块（含 XOR 加密存取）

**Files:**
- Create: `js/core/persistence.js`

- [ ] **Step 1: 创建 persistence.js**

```js
import { getConfig } from '../utils/config-loader.js';
import { encrypt, decrypt, generateKey } from '../utils/crypto.js';

const CONFIG = getConfig();
const PREFIX = CONFIG.STORAGE_PREFIX;

// sessionStorage 加密密钥（标签页级存活）
function getCryptoKey() {
  let key = sessionStorage.getItem('_cryptoKey');
  if (!key) {
    key = generateKey();
    sessionStorage.setItem('_cryptoKey', key);
  }
  return key;
}

function saveItem(id, value) {
  let storedValue = value;
  if (id === 'api-key') {
    storedValue = encrypt(value, getCryptoKey());
  }
  localStorage.setItem(PREFIX + id, storedValue);
}

function loadItem(id) {
  const raw = localStorage.getItem(PREFIX + id);
  if (raw === null) return '';
  if (id === 'api-key') {
    return decrypt(raw, getCryptoKey());
  }
  return raw;
}

function removeItem(id) {
  localStorage.removeItem(PREFIX + id);
}

export function init() {
  // 读取所有带 id 的 input/textarea
  document.querySelectorAll('input[type="text"], textarea, input[type="password"]').forEach(input => {
    if (!input.id) return;
    const saved = loadItem(input.id);
    if (saved) input.value = saved;

    input.addEventListener('input', () => {
      saveItem(input.id, input.value);
    });
  });

  // 教学环节持久化（动态行由 teaching-process.js 管理）
  loadTeachingProcess();
}

export function saveFormData() {
  document.querySelectorAll('input[type="text"], textarea, input[type="password"]').forEach(input => {
    if (input.id) saveItem(input.id, input.value);
  });
}

export function clearFormData(keepApiKey = true) {
  const all = document.querySelectorAll('input[type="text"], textarea');
  all.forEach(input => {
    if (keepApiKey && input.id === 'api-key') return;
    input.value = '';
    if (input.id) removeItem(input.id);
  });

  // 清空教学环节 localStorage
  const prefix = PREFIX + 'teachingProcess_';
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

function loadTeachingProcess() {
  const tbody = document.querySelector('#lesson table tbody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  rows.forEach((row, rowIndex) => {
    const textareas = row.querySelectorAll('textarea');
    textareas.forEach((ta, colIndex) => {
      const saved = localStorage.getItem(PREFIX + `teachingProcess_${rowIndex}_${colIndex}`);
      if (saved) ta.value = saved;
      ta.addEventListener('input', () => {
        localStorage.setItem(PREFIX + `teachingProcess_${rowIndex}_${colIndex}`, ta.value);
      });
    });
  });
}
```

- [ ] **Step 2: 提交**

```bash
git add js/core/persistence.js
git commit -m "feat: 创建表单持久化模块（含 XOR 加密存取 API Key）"
```

---

### Task 8: 创建 API 调用模块

**Files:**
- Create: `js/ai/api.js`

- [ ] **Step 1: 创建 api.js**

```js
import { getConfig } from '../utils/config-loader.js';

const CONFIG = getConfig();

export async function callDeepSeekAPI(apiKey, coverData) {
  const prompt = `你是一个专业的中学教案编写助手。请根据以下信息生成一份完整的教案内容：

学科：${coverData.subject}
年级：${coverData.grade}
班级：${coverData.class}
学年度：${coverData.academicYear}
教师：${coverData.teacher}
课题：${coverData.lessonTopic}

请生成以下内容（使用JSON格式返回）：
{
  "curriculumRequire": "课标要求内容（600-800字）",
  "literacyTarget": "素养目标内容（3-4个具体目标，每个目标单独一行）",
  "keyPoints": "教学重点（650-800字）",
  "difficultPoints": "教学难点（600-750字）",
  "studentAnalysis": "学情分析（800-1000字）",
  "teachingStrategy": "教学策略（1000-1200字）",
  "teachingResources": "教学资源（列举5-8项具体资源）",
  "teachingProcess": [
    {
      "teacherActivity": "教师活动内容（每个环节150-200字）",
      "studentActivity": "学生活动内容（每个环节150-200字）",
      "designIntent": "设计意图（每个环节100-150字）"
    }
  ],
  "blackboardDesign": "板书设计内容（清晰的结构化内容，400-600字）",
  "reflection": "教学反思（900-1200字）"
}

要求：
1. 内容要详实、专业，符合新课标要求
2. 素养目标要具体、可操作、可评估
3. 教学过程要包含8-10个环节，每个环节要详细
4. 所有内容要符合${coverData.grade}学生的认知水平
5. 返回标准的JSON格式，不要有额外的文字说明`;

  const response = await fetch(CONFIG.API_BASE_URL + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: CONFIG.API_MODEL,
      messages: [
        { role: 'system', content: '你是一个专业的中学教案编写助手，擅长根据新课标要求生成高质量的教案内容。你的回答必须是标准的JSON格式。' },
        { role: 'user', content: prompt }
      ],
      temperature: CONFIG.API_TEMPERATURE,
      max_tokens: CONFIG.API_MAX_TOKENS
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API调用失败: ${response.status} ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // 解析 JSON
  let jsonContent = content.trim();
  if (jsonContent.startsWith('```json')) {
    jsonContent = jsonContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/```\n?/, '').replace(/\n?```$/, '');
  }

  return JSON.parse(jsonContent);
}
```

- [ ] **Step 2: 提交**

```bash
git add js/ai/api.js
git commit -m "feat: 创建 DeepSeek API 调用模块"
```

---

### Task 9: 创建 AI 生成 UI 模块

**Files:**
- Create: `js/ai/generation.js`

- [ ] **Step 1: 创建 generation.js**

```js
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

  // 验证必填项
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

  // 教学过程
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
  // 清空教学环节
  const tbody = document.querySelector('#lesson table tbody');
  if (tbody) {
    tbody.querySelectorAll('tr').forEach(row => {
      row.querySelectorAll('textarea').forEach(ta => { ta.value = ''; });
    });
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add js/ai/generation.js
git commit -m "feat: 创建 AI 生成 UI 模块"
```

---

### Task 10: 创建教学环节动态增删模块

**Files:**
- Create: `js/ui/teaching-process.js`

- [ ] **Step 1: 创建 teaching-process.js**

```js
export function init() {
  addControls();
}

function addControls() {
  const container = document.querySelector('#lesson .overflow-x-auto');
  if (!container) return;

  const controls = document.createElement('div');
  controls.className = 'flex gap-3 mb-3';
  controls.innerHTML = `
    <button id="add-row-btn" class="px-4 py-2 text-sm font-semibold text-white" style="background: var(--color-primary); cursor: pointer;">
      <i class="fas fa-plus mr-1"></i> 添加环节
    </button>
    <button id="remove-row-btn" class="px-4 py-2 text-sm font-semibold text-white" style="background: var(--color-accent); cursor: pointer;">
      <i class="fas fa-minus mr-1"></i> 删除环节
    </button>
  `;

  container.insertBefore(controls, container.querySelector('table'));

  document.getElementById('add-row-btn')?.addEventListener('click', addRow);
  document.getElementById('remove-row-btn')?.addEventListener('click', removeRow);
}

function addRow() {
  const tbody = document.querySelector('#lesson table tbody');
  if (!tbody) return;

  const templateRow = tbody.querySelector('tr');
  if (!templateRow) return;

  const newRow = templateRow.cloneNode(true);
  newRow.querySelectorAll('textarea').forEach(ta => { ta.value = ''; });
  tbody.appendChild(newRow);

  // 重新绑定持久化事件
  bindRowPersistence(newRow);
}

function removeRow() {
  const tbody = document.querySelector('#lesson table tbody');
  if (!tbody) return;
  if (tbody.querySelectorAll('tr').length <= 1) {
    alert('至少保留一个教学环节');
    return;
  }
  tbody.removeChild(tbody.lastElementChild);
}

function bindRowPersistence(row) {
  const prefix = 'lessonPlan_teachingProcess_';
  const tbody = row.closest('tbody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  const rowIndex = Array.from(rows).indexOf(row);

  row.querySelectorAll('textarea').forEach((ta, colIndex) => {
    ta.addEventListener('input', () => {
      localStorage.setItem(`${prefix}${rowIndex}_${colIndex}`, ta.value);
    });
  });
}
```

- [ ] **Step 2: 提交**

```bash
git add js/ui/teaching-process.js
git commit -m "feat: 创建教学环节动态增删模块"
```

---

### Task 11: 创建 PDF 导出模块

**Files:**
- Create: `js/pdf/export.js`

- [ ] **Step 1: 创建 export.js**

```js
import { collectLessonData } from '../core/data.js';

export function init() {
  const btn = document.getElementById('export-pdf-btn');
  if (btn) {
    btn.addEventListener('click', exportToPDF);
  }
}

function exportToPDF() {
  try {
    const lessonData = collectLessonData();
    const html = generateHTMLTemplate(lessonData);

    void document.body.offsetHeight;

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const cleanup = () => {
      if (printFrame && printFrame.parentNode) {
        try {
          if (printFrame.contentWindow) {
            printFrame.contentWindow.onafterprint = null;
            printFrame.contentWindow.onbeforeunload = null;
          }
        } catch (_) {}
        printFrame.parentNode.removeChild(printFrame);
      }
    };

    printFrame.onload = () => {
      try {
        const fw = printFrame.contentWindow;
        if (!fw) { cleanup(); return; }

        fw.onafterprint = () => setTimeout(cleanup, 300);
        fw.onbeforeunload = () => setTimeout(cleanup, 300);

        fw.focus();
        fw.requestAnimationFrame(() => {
          setTimeout(() => {
            try { fw.print(); } catch (_) { setTimeout(cleanup, 500); }
          }, 100);
        });
      } catch (_) { cleanup(); }
    };

    printFrame.srcdoc = html;
  } catch (error) {
    console.error('PDF导出失败:', error);
    alert('教案导出失败，请重试。\n' + error.message);
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function generateHTMLTemplate(data) {
  let teachingProcessContent = '';
  let studentActivityContent = '';
  let designIntentContent = '';

  if (data.teachingProcess && data.teachingProcess.length > 0) {
    teachingProcessContent = data.teachingProcess.map((p, i) => {
      return p.teacherActivity ? `【环节${i + 1}】\n${escapeHtml(p.teacherActivity)}` : '';
    }).filter(Boolean).join('\n\n');

    studentActivityContent = data.teachingProcess.map((p, i) => {
      return p.studentActivity ? `【环节${i + 1}】\n${escapeHtml(p.studentActivity)}` : '';
    }).filter(Boolean).join('\n\n');

    designIntentContent = data.teachingProcess.map((p, i) => {
      return p.designIntent ? `【环节${i + 1}】\n${escapeHtml(p.designIntent)}` : '';
    }).filter(Boolean).join('\n\n');
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>厦门市第九中学教案本 - ${escapeHtml(data.lessonTopic || '教案')}</title>
<style>
    body {
        font-family: 'SimSun', '宋体', serif;
        font-size: 16px;
        color: #000;
        background-color: #f5f5f5;
        margin: 0;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .page {
        width: 794px;
        min-height: 1123px;
        border: 1px solid #ccc;
        margin-bottom: 20px;
        padding: 60px;
        box-sizing: border-box;
        background-color: white;
        page-break-after: always;
        display: flex;
        flex-direction: column;
        position: relative;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .page.fixed-height { height: 1123px; }
    .cover-page {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        text-align: center;
        flex-grow: 1;
    }
    .cover-title {
        font-size: 42px;
        color: #465d87;
        letter-spacing: 5px;
        margin-top: 80px;
    }
    .cover-subtitle {
        font-size: 68px;
        font-weight: bold;
        color: #465d87;
        letter-spacing: 20px;
        margin-top: 60px;
        margin-bottom: 150px;
    }
    .info-section { width: 60%; margin: 0 auto; text-align: left; }
    .info-line {
        font-size: 24px;
        color: #465d87;
        margin-bottom: 25px;
        display: flex;
        align-items: center;
    }
    .info-line span {
        width: 100px;
        display: inline-block;
        letter-spacing: 8px;
        text-align: justify;
        text-align-last: justify;
        flex-shrink: 0;
    }
    .info-line .line-content {
        flex-grow: 1;
        border-bottom: 1px solid #465d87;
        margin-left: 10px;
        padding-left: 10px;
        min-height: 1.2em;
    }
    .toc-page { display: flex; flex-direction: column; }
    .toc-page h1 {
        text-align: center;
        font-size: 36px;
        font-weight: bold;
        letter-spacing: 10px;
        margin-top: 30px;
        margin-bottom: 20px;
    }
    .content-table, .detail-table, .process-table {
        width: 100%;
        border-collapse: collapse;
        border: 2px solid #000;
        table-layout: fixed;
    }
    .content-table th, .content-table td,
    .detail-table th, .detail-table td,
    .process-table th, .process-table td {
        border: 1px solid #000;
        padding: 8px;
        text-align: center;
        font-size: 18px;
        box-sizing: border-box;
    }
    .content-table th { font-weight: normal; height: 40px; background-color: #fff; }
    .content-table td { height: 40px; }
    .content-table .col-seq { width: 12%; text-align: center; }
    .content-table .col-title { width: 68%; text-align: left; padding-left: 15px; }
    .content-table .col-page { width: 20%; text-align: center; }
    .detail-table { table-layout: fixed; margin-top: 20px; }
    .detail-table td { vertical-align: top; padding: 8px; }
    .detail-table .row-header {
        font-weight: normal; width: 120px; height: auto; padding: 8px;
        text-align: center; letter-spacing: 5px; white-space: nowrap;
        vertical-align: top; padding-top: 12px;
    }
    .detail-table .nested-table { width: 100%; border-collapse: collapse; margin: 0; }
    .detail-table .nested-table td {
        border: none; border-bottom: 1px solid #000;
        padding: 8px; text-align: left; vertical-align: middle; font-size: 16px;
    }
    .detail-table .nested-table tr:last-child td { border-bottom: none; }
    .detail-table .nested-table .label {
        width: 45%; border-right: 1px solid #000; text-align: center; letter-spacing: 3px;
    }
    .detail-table .nested-table .value { width: 55%; text-align: left; padding-left: 10px; }
    .detail-table tr:nth-child(1) { height: 50px; }
    .detail-table tr:nth-child(2),
    .detail-table tr:nth-child(3),
    .detail-table tr:nth-child(4),
    .detail-table tr:nth-child(5),
    .detail-table tr:nth-child(6),
    .detail-table tr:nth-child(7),
    .detail-table tr:nth-child(8) { height: auto; }
    .process-page-container { display: flex; flex-direction: column; width: 100%; height: 100%; }
    .process-table-main {
        width: 100%; flex: 0 0 auto;
        border-collapse: collapse; border: 2px solid #000; table-layout: fixed;
    }
    .process-table-main thead th {
        height: 45px; background-color: #fff; font-weight: normal;
        border: 1px solid #000; padding: 8px; text-align: center; font-size: 18px; box-sizing: border-box;
    }
    .process-table-main thead tr:first-child th { font-size: 18px; letter-spacing: 2px; }
    .process-table-main thead tr:last-child th:nth-child(1) { width: 33.33%; }
    .process-table-main thead tr:last-child th:nth-child(2) { width: 33.34%; }
    .process-table-main thead tr:last-child th:nth-child(3) { width: 33.33%; }
    .process-table-main tbody tr { height: auto; }
    .process-table-main tbody td {
        border: 1px solid #000; padding: 10px; vertical-align: top; text-align: left;
        font-size: 13px; line-height: 1.5; box-sizing: border-box; word-wrap: break-word;
        overflow-wrap: break-word; white-space: pre-wrap;
        text-indent: 0; letter-spacing: 0.3px;
    }
    .process-table-main tbody td:nth-child(1) { width: 33.33%; }
    .process-table-main tbody td:nth-child(2) { width: 33.34%; }
    .process-table-main tbody td:nth-child(3) { width: 33.33%; }
    .process-table-footer {
        width: 100%; border-collapse: collapse; border: 2px solid #000;
        border-top: none; margin-top: -2px; table-layout: fixed; flex: 0 0 auto;
    }
    .process-table-footer td {
        border: 1px solid #000; padding: 8px; text-align: left;
        font-size: 13px; vertical-align: top; line-height: 1.5; box-sizing: border-box;
        white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word;
    }
    .process-table-footer .row-header {
        width: 120px; text-align: center; letter-spacing: 5px;
        white-space: nowrap; vertical-align: middle;
    }
    .process-table-footer .footer-content { height: auto; min-height: 80px; text-align: left; }
    .page-footer { display: none; }
    @page { size: A4; margin: 0; }
    @media print {
        body { padding: 0; background-color: white; }
        .page {
            border: none; margin: 0; page-break-after: always;
            box-shadow: none; height: auto; min-height: auto;
        }
        .page.fixed-height { height: 100vh; min-height: 100vh; max-height: 100vh; }
        .page:last-child { page-break-after: auto; }
        .detail-table { page-break-inside: auto; }
        .detail-table tr { page-break-inside: avoid; page-break-after: auto; }
    }
    .detail-table td:not(.row-header) {
        text-align: left; line-height: 1.6; word-wrap: break-word;
        overflow-wrap: break-word; white-space: pre-wrap; font-size: 14px;
    }
    * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    table { border-spacing: 0; }
    .detail-table td[colspan] { min-height: 30px; }
</style>
</head>
<body>

<div class="page fixed-height">
    <div class="cover-page">
        <div>
            <div class="cover-title">厦门市第九中学</div>
            <div class="cover-subtitle">教 案 本</div>
        </div>
        <div class="info-section">
            <div class="info-line"><span>学 科</span>: <div class="line-content">${escapeHtml(data.subject || '')}</div></div>
            <div class="info-line"><span>年 级</span>: <div class="line-content">${escapeHtml(data.grade || '')}</div></div>
            <div class="info-line"><span>班 级</span>: <div class="line-content">${escapeHtml(data.class || '')}</div></div>
            <div class="info-line"><span>学年度</span>: <div class="line-content">${escapeHtml(data.academicYear || '')}</div></div>
            <div class="info-line"><span>教 师</span>: <div class="line-content">${escapeHtml(data.teacher || '')}</div></div>
        </div>
    </div>
</div>

<div class="page fixed-height toc-page">
    <h1>教案目录</h1>
    <table class="content-table">
        <thead>
            <tr>
                <th class="col-seq">序号</th>
                <th class="col-title">课 题</th>
                <th class="col-page">页码</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>1</td><td>${escapeHtml(data.lessonTopic || '')}</td><td>3</td></tr>
            <tr><td>2</td><td></td><td></td></tr>
            <tr><td>3</td><td></td><td></td></tr>
            <tr><td>4</td><td></td><td></td></tr>
            <tr><td>5</td><td></td><td></td></tr>
            <tr><td>6</td><td></td><td></td></tr>
            <tr><td>7</td><td></td><td></td></tr>
            <tr><td>8</td><td></td><td></td></tr>
            <tr><td>9</td><td></td><td></td></tr>
            <tr><td>10</td><td></td><td></td></tr>
            <tr><td>11</td><td></td><td></td></tr>
            <tr><td>12</td><td></td><td></td></tr>
            <tr><td>13</td><td></td><td></td></tr>
            <tr><td>14</td><td></td><td></td></tr>
            <tr><td>15</td><td></td><td></td></tr>
        </tbody>
    </table>
</div>

<div class="page">
    <table class="detail-table">
        <tbody>
            <tr>
                <td class="row-header">课题</td>
                <td colspan="2">${escapeHtml(data.lessonTopic || '')}</td>
                <td style="width: 200px;">
                    <table class="nested-table">
                        <tr><td class="label">备课时间</td><td class="value">${escapeHtml(data.prepareTime || '')}</td></tr>
                        <tr><td class="label">课 时 数</td><td class="value">${escapeHtml(data.classHours || '')}</td></tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="row-header">课标要求</td>
                <td colspan="3">${escapeHtml(data.curriculumRequire || '')}</td>
            </tr>
            <tr>
                <td class="row-header">素养目标</td>
                <td colspan="3">${escapeHtml(data.literacyTarget || '')}</td>
            </tr>
            <tr>
                <td class="row-header">重点</td>
                <td colspan="3">${escapeHtml(data.keyPoints || '')}</td>
            </tr>
            <tr>
                <td class="row-header">难点</td>
                <td colspan="3">${escapeHtml(data.difficultPoints || '')}</td>
            </tr>
            <tr>
                <td class="row-header">学情分析</td>
                <td colspan="3">${escapeHtml(data.studentAnalysis || '')}</td>
            </tr>
            <tr>
                <td class="row-header">教学策略</td>
                <td colspan="3">${escapeHtml(data.teachingStrategy || '')}</td>
            </tr>
            <tr>
                <td class="row-header">教学资源</td>
                <td colspan="3">${escapeHtml(data.teachingResources || '')}</td>
            </tr>
        </tbody>
    </table>
</div>

<div class="page">
    <table class="process-table-main" style="height: auto;">
        <thead>
            <tr>
                <th colspan="3">教学过程</th>
            </tr>
            <tr>
                <th>教师活动</th>
                <th>学生活动</th>
                <th>设计意图</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${teachingProcessContent || ''}</td>
                <td>${studentActivityContent || ''}</td>
                <td>${designIntentContent || ''}</td>
            </tr>
        </tbody>
    </table>
    <table class="process-table-footer" style="margin-top: 20px;">
        <tr>
            <td class="row-header">板书设计</td>
            <td class="footer-content">${escapeHtml(data.blackboardDesign || '')}</td>
        </tr>
        <tr>
            <td class="row-header">教学反思</td>
            <td class="footer-content">${escapeHtml(data.reflection || '')}</td>
        </tr>
    </table>
</div>

</body>
</html>`;
}
```

- [ ] **Step 2: 提交**

```bash
git add js/pdf/export.js
git commit -m "feat: 创建 PDF 导出模块"
```

---

### Task 12: 创建入口 main.js 并更新 index.html

**Files:**
- Create: `js/main.js`
- Modify: `index.html`

- [ ] **Step 1: 创建 main.js**

```js
import { init as initNav } from './core/navigation.js';
import { init as initDate } from './core/date.js';
import { init as initPersistence } from './core/persistence.js';
import { init as initGeneration } from './ai/generation.js';
import { init as initExport } from './pdf/export.js';
import { init as initTeachingProcess } from './ui/teaching-process.js';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initDate();
  initPersistence();
  initGeneration();
  initExport();
  initTeachingProcess();
});

// 暴露全局函数（用于 HTML onclick 或控制台调试）
import { clearFormData } from './core/persistence.js';
import { exportToJSON, importFromJSON } from './core/data.js';

window.clearAllData = () => {
  if (confirm('确定要清除所有保存的数据吗？此操作不可恢复。')) {
    clearFormData(false);
    location.reload();
  }
};
window.exportData = exportToJSON;
window.importData = importFromJSON;
window.printLessonPlan = () => window.print();
```

- [ ] **Step 2: 更新 index.html — 替换 script 标签**

将：
```html
<script src="script-core.js"></script>
<script src="script-ai.js"></script>
```
改为：
```html
<script type="module" src="js/main.js"></script>
```

- [ ] **Step 3: 提交**

```bash
git add js/main.js index.html
git commit -m "feat: 创建入口模块并更新 index.html 引用"
```

---

### Task 13: 删除旧文件并清理

**Files:**
- Delete: `script-core.js`
- Delete: `script-ai.js`
- Delete: `oldsrc/`

- [ ] **Step 1: 删除文件**

```bash
git rm script-core.js script-ai.js
git rm -r oldsrc/
```

- [ ] **Step 2: 提交**

```bash
git commit -m "chore: 删除旧版文件（script-core.js, script-ai.js, oldsrc/）"
```

---

### Task 14: 功能验证

- [ ] **Step 1: 打开 index.html 验证页面正常加载**

在浏览器中打开 `index.html`，确认：
- 页面正常渲染，无控制台错误
- 导航栏高亮、平滑滚动正常
- 日期正常显示
- 表单可输入、刷新后数据保持

- [ ] **Step 2: 验证 API 密钥加密**

- 在 API 密钥输入框中输入值，点击"AI智能生成教案"（可取消确认）
- 打开浏览器开发者工具 → Application → Local Storage
- 确认 `lessonPlan_api-key` 的值是乱码（非明文）

- [ ] **Step 3: 验证教学环节动态增删**

- 点击"添加环节"按钮，确认新增一行
- 点击"删除环节"按钮，确认删除最后一行（至少保留一行）
- 在新行中输入内容，刷新页面，确认数据保持

- [ ] **Step 4: 验证 PDF 导出**

- 填写部分表单数据
- 点击"导出PDF教案"，确认能正常弹出打印对话框

- [ ] **Step 5: 验证 JSON 导入导出**

- 在浏览器控制台调用 `exportData()`，确认下载 JSON 文件
- 调用 `importData()`，选择导出的 JSON 文件，确认数据回填

- [ ] **Step 6: 提交最终验证**

```bash
git add -A
git commit -m "chore: 项目重构完成"
```
