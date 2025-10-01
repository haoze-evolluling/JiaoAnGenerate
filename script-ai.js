/**
 * 厦门市第九中学教案本 - AI生成功能模块
 * 包含：AI智能生成教案、PDF导出等功能
 */

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  initAIGeneration();
});

/**
 * 初始化AI智能生成功能
 */
function initAIGeneration() {
  const apiKeyInput = document.getElementById('api-key');
  const generateBtn = document.getElementById('ai-generate-btn');
  const clearBtn = document.getElementById('clear-all-btn');
  const loadingIndicator = document.getElementById('loading-indicator');
  
  // 设置默认API密钥
  if (apiKeyInput) {
    apiKeyInput.value = 'sk-0560c9a849694436a71c1ef4c053505a';
  }
  
  // 绑定生成按钮事件
  if (generateBtn) {
    generateBtn.addEventListener('click', () => generateLessonPlanWithAI());
  }
  
  // 绑定导出PDF按钮事件
  const exportPdfBtn = document.getElementById('export-pdf-btn');
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', () => exportLessonPlanToPDF());
  }
  
  // 绑定清空按钮事件
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('确定要清空所有教案内容吗？此操作不可恢复。')) {
        clearAllLessonContent();
      }
    });
  }
}

/**
 * 使用AI生成教案
 */
async function generateLessonPlanWithAI() {
  const apiKeyInput = document.getElementById('api-key');
  const loadingIndicator = document.getElementById('loading-indicator');
  const generateBtn = document.getElementById('ai-generate-btn');
  
  // 获取封面信息
  const coverData = {
    subject: document.getElementById('subject')?.value?.trim() || '',
    grade: document.getElementById('grade')?.value?.trim() || '',
    class: document.getElementById('class')?.value?.trim() || '',
    academicYear: document.getElementById('academic-year')?.value?.trim() || '',
    teacher: document.getElementById('teacher')?.value?.trim() || '',
    lessonTopic: document.getElementById('lesson-topic')?.value?.trim() || ''
  };
  
  // 调试：显示读取到的信息
  console.log('读取到的封面信息：', coverData);
  
  // 验证必填项
  const missingFields = [];
  if (!coverData.subject) missingFields.push('学科');
  if (!coverData.grade) missingFields.push('年级');
  
  if (missingFields.length > 0) {
    alert(`请先在封面区域填写以下信息：${missingFields.join('、')}！\n\n位置：页面顶部的"厦门市第九中学教案本"封面卡片中。`);
    // 滚动到封面区域
    document.getElementById('cover')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  
  // 如果没有填写课题，提示用户
  if (!coverData.lessonTopic) {
    const confirmGenerate = confirm('未填写课题信息，是否继续生成通用教案？\n\n建议：请先滚动到"教案详情"区域，在"备课信息"的"课题"栏填写具体课题后再生成。\n\n点击"确定"将生成通用教案模板。');
    if (!confirmGenerate) {
      // 滚动到教案详情区域
      document.getElementById('lesson')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // 使用默认课题
    coverData.lessonTopic = `${coverData.subject}教学`;
  }
  
  // 获取API密钥
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    alert('请输入API密钥！');
    return;
  }
  
  // 显示加载状态
  generateBtn.disabled = true;
  loadingIndicator.style.display = 'flex';
  
  try {
    // 调用DeepSeek API
    const generatedContent = await callDeepSeekAPI(apiKey, coverData);
    
    // 填充生成的内容
    fillGeneratedContent(generatedContent);
    
    alert('教案生成成功！');
    
    // 滚动到教案详情区域
    const lessonSection = document.getElementById('lesson');
    if (lessonSection) {
      lessonSection.scrollIntoView({ behavior: 'smooth' });
    }
    
  } catch (error) {
    console.error('生成失败:', error);
    alert('教案生成失败，请检查API密钥或稍后重试。错误信息：' + error.message);
  } finally {
    generateBtn.disabled = false;
    loadingIndicator.style.display = 'none';
  }
}

/**
 * 调用DeepSeek API
 */
async function callDeepSeekAPI(apiKey, coverData) {
  const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
  
  const prompt = `你是一个专业的中学教案编写助手。请根据以下信息生成一份完整的教案内容：

学科：${coverData.subject}
年级：${coverData.grade}
班级：${coverData.class}
学年度：${coverData.academicYear}
教师：${coverData.teacher}
课题：${coverData.lessonTopic}

请生成以下内容（使用JSON格式返回）：
{
  "curriculumRequire": "课标要求内容（200-300字）",
  "literacyTarget": "素养目标内容（3-4个具体目标，每个目标单独一行）",
  "keyPoints": "教学重点（150-200字）",
  "difficultPoints": "教学难点（150-200字）",
  "studentAnalysis": "学情分析（200-300字）",
  "teachingStrategy": "教学策略（200-300字）",
  "teachingResources": "教学资源（列举5-8项具体资源）",
  "teachingProcess": [
    {
      "teacherActivity": "教师活动内容",
      "studentActivity": "学生活动内容",
      "designIntent": "设计意图"
    }
  ],
  "blackboardDesign": "板书设计内容（清晰的结构化内容）",
  "reflection": "教学反思（200-300字）"
}

要求：
1. 内容要详实、专业，符合新课标要求
2. 素养目标要具体、可操作、可评估
3. 教学过程要包含3-5个环节，每个环节要详细
4. 所有内容要符合${coverData.grade}学生的认知水平
5. 返回标准的JSON格式，不要有额外的文字说明`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的中学教案编写助手，擅长根据新课标要求生成高质量的教案内容。你的回答必须是标准的JSON格式。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API调用失败: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
  }
  
  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // 尝试解析JSON
  try {
    // 提取JSON内容（去除可能的markdown代码块标记）
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('JSON解析失败，原始内容：', content);
    throw new Error('AI返回的内容格式不正确，请重试');
  }
}

/**
 * 填充生成的内容到表单
 */
function fillGeneratedContent(content) {
  // 填充备课信息
  if (content.curriculumRequire) {
    const el = document.getElementById('curriculum-require');
    if (el) {
      el.value = content.curriculumRequire;
      localStorage.setItem('lessonPlan_curriculum-require', content.curriculumRequire);
    }
  }
  
  if (content.literacyTarget) {
    const el = document.getElementById('literacy-target');
    if (el) {
      el.value = content.literacyTarget;
      localStorage.setItem('lessonPlan_literacy-target', content.literacyTarget);
    }
  }
  
  if (content.keyPoints) {
    const el = document.getElementById('key-points');
    if (el) {
      el.value = content.keyPoints;
      localStorage.setItem('lessonPlan_key-points', content.keyPoints);
    }
  }
  
  if (content.difficultPoints) {
    const el = document.getElementById('difficult-points');
    if (el) {
      el.value = content.difficultPoints;
      localStorage.setItem('lessonPlan_difficult-points', content.difficultPoints);
    }
  }
  
  if (content.studentAnalysis) {
    const el = document.getElementById('student-analysis');
    if (el) {
      el.value = content.studentAnalysis;
      localStorage.setItem('lessonPlan_student-analysis', content.studentAnalysis);
    }
  }
  
  if (content.teachingStrategy) {
    const el = document.getElementById('teaching-strategy');
    if (el) {
      el.value = content.teachingStrategy;
      localStorage.setItem('lessonPlan_teaching-strategy', content.teachingStrategy);
    }
  }
  
  if (content.teachingResources) {
    const el = document.getElementById('teaching-resources');
    if (el) {
      el.value = content.teachingResources;
      localStorage.setItem('lessonPlan_teaching-resources', content.teachingResources);
    }
  }
  
  // 填充教学过程（填充到表格中）
  if (content.teachingProcess && Array.isArray(content.teachingProcess)) {
    const processTable = document.querySelector('#lesson table tbody');
    if (processTable) {
      const rows = processTable.querySelectorAll('tr');
      content.teachingProcess.forEach((process, index) => {
        if (index < rows.length) {
          const textareas = rows[index].querySelectorAll('textarea');
          if (textareas[0]) {
            textareas[0].value = process.teacherActivity || '';
            localStorage.setItem(`lessonPlan_teachingProcess_${index}_0`, process.teacherActivity || '');
          }
          if (textareas[1]) {
            textareas[1].value = process.studentActivity || '';
            localStorage.setItem(`lessonPlan_teachingProcess_${index}_1`, process.studentActivity || '');
          }
          if (textareas[2]) {
            textareas[2].value = process.designIntent || '';
            localStorage.setItem(`lessonPlan_teachingProcess_${index}_2`, process.designIntent || '');
          }
        }
      });
    }
  }
  
  // 填充板书设计和教学反思
  if (content.blackboardDesign) {
    const blackboardEl = document.getElementById('blackboard-design');
    if (blackboardEl) {
      blackboardEl.value = content.blackboardDesign;
      localStorage.setItem('lessonPlan_blackboard-design', content.blackboardDesign);
    }
  }
  
  if (content.reflection) {
    const reflectionEl = document.getElementById('teaching-reflection');
    if (reflectionEl) {
      reflectionEl.value = content.reflection;
      localStorage.setItem('lessonPlan_teaching-reflection', content.reflection);
    }
  }
}

/**
 * 清空所有教案内容
 */
function clearAllLessonContent() {
  // 清空所有输入框和文本框
  const allInputs = document.querySelectorAll('input[type="text"], textarea');
  allInputs.forEach(input => {
    // 保留API密钥
    if (input.id !== 'api-key') {
      input.value = '';
      if (input.id) {
        localStorage.removeItem(`lessonPlan_${input.id}`);
      }
    }
  });
  
  // 清空教学过程表格的缓存
  const processTable = document.querySelector('#lesson table tbody');
  if (processTable) {
    const rows = processTable.querySelectorAll('tr');
    rows.forEach((row, rowIndex) => {
      const textareas = row.querySelectorAll('textarea');
      textareas.forEach((textarea, colIndex) => {
        textarea.value = '';
        localStorage.removeItem(`lessonPlan_teachingProcess_${rowIndex}_${colIndex}`);
      });
    });
  }
  
  alert('所有内容已清空！');
}

/**
 * 导出教案为PDF格式
 * 使用浏览器打印功能生成PDF
 */
function exportLessonPlanToPDF() {
  try {
    // 获取所有教案数据
    const lessonData = collectLessonData();
    
    // 生成HTML内容
    const htmlContent = generateHTMLTemplate(lessonData);

    // 为提升稳定性，提前强制触发重排
    void document.body.offsetHeight;
    
    // 创建一个隐藏的iframe并使用srcdoc加载内容，监听打印完成清理资源
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
          // 移除事件监听，避免泄漏
          if (printFrame.contentWindow) {
            printFrame.contentWindow.onafterprint = null;
            printFrame.contentWindow.onbeforeunload = null;
          }
        } catch (_) {}
        printFrame.parentNode.removeChild(printFrame);
      }
    };

    printFrame.onload = function() {
      try {
        const frameWindow = printFrame.contentWindow;
        if (!frameWindow) {
          cleanup();
          return;
        }

        // 打印完成后清理
        frameWindow.onafterprint = () => {
          // 给予系统时间关闭打印对话框
          setTimeout(cleanup, 300);
        };

        // 某些浏览器会在关闭iframe前触发unload，做兜底清理
        frameWindow.onbeforeunload = () => {
          setTimeout(cleanup, 300);
        };

        // 等待一帧确保布局完成
        frameWindow.focus();
        frameWindow.requestAnimationFrame(() => {
          setTimeout(() => {
            try {
              frameWindow.print();
            } catch (_) {
              // 打印异常兜底清理
              setTimeout(cleanup, 500);
            }
          }, 100);
        });
      } catch (_) {
        cleanup();
      }
    };

    // 通过srcdoc载入内容，保证onload可靠触发
    printFrame.srcdoc = htmlContent;
    
  } catch (error) {
    console.error('PDF导出失败:', error);
    alert('教案导出失败，请重试。错误信息：' + error.message);
  }
}

/**
 * 收集教案数据
 */
function collectLessonData() {
  const data = {};
  
  // 封面信息
  data.subject = document.getElementById('subject')?.value?.trim() || '';
  data.grade = document.getElementById('grade')?.value?.trim() || '';
  data.class = document.getElementById('class')?.value?.trim() || '';
  data.academicYear = document.getElementById('academic-year')?.value?.trim() || '';
  data.teacher = document.getElementById('teacher')?.value?.trim() || '';
  
  // 备课信息
  data.lessonTopic = document.getElementById('lesson-topic')?.value?.trim() || '';
  data.prepareTime = document.getElementById('prepare-time')?.value?.trim() || '';
  data.classHours = document.getElementById('class-hours')?.value?.trim() || '';
  data.curriculumRequire = document.getElementById('curriculum-require')?.value?.trim() || '';
  data.literacyTarget = document.getElementById('literacy-target')?.value?.trim() || '';
  data.keyPoints = document.getElementById('key-points')?.value?.trim() || '';
  data.difficultPoints = document.getElementById('difficult-points')?.value?.trim() || '';
  data.studentAnalysis = document.getElementById('student-analysis')?.value?.trim() || '';
  data.teachingStrategy = document.getElementById('teaching-strategy')?.value?.trim() || '';
  data.teachingResources = document.getElementById('teaching-resources')?.value?.trim() || '';
  
  // 教学过程
  data.teachingProcess = [];
  const processTable = document.querySelector('#lesson table tbody');
  if (processTable) {
    const rows = processTable.querySelectorAll('tr');
    rows.forEach(row => {
      const textareas = row.querySelectorAll('textarea');
      if (textareas.length >= 3) {
        const teacherActivity = textareas[0].value.trim();
        const studentActivity = textareas[1].value.trim();
        const designIntent = textareas[2].value.trim();
        
        if (teacherActivity || studentActivity || designIntent) {
          data.teachingProcess.push({
            teacherActivity,
            studentActivity,
            designIntent
          });
        }
      }
    });
  }
  
  // 板书设计和教学反思
  data.blackboardDesign = document.getElementById('blackboard-design')?.value?.trim() || '';
  data.reflection = document.getElementById('teaching-reflection')?.value?.trim() || '';
  
  return data;
}

/**
 * 生成HTML模板
 * 使用newja.html的模板格式
 */
function generateHTMLTemplate(data) {
  
  // 生成教学过程HTML - 分配到两页
  let teachingProcessPage1 = '';
  let teachingProcessPage2 = '';
  let studentActivityPage1 = '';
  let designIntentPage1 = '';
  let studentActivityPage2 = '';
  let designIntentPage2 = '';
  
  if (data.teachingProcess && data.teachingProcess.length > 0) {
    // 第一页显示前半部分
    const midPoint = Math.ceil(data.teachingProcess.length / 2);
    const firstHalf = data.teachingProcess.slice(0, midPoint);
    const secondHalf = data.teachingProcess.slice(midPoint);
    
    // 生成第一页内容
    teachingProcessPage1 = firstHalf.map((process, index) => {
      const content = process.teacherActivity || '';
      return content ? `【环节${index + 1}】\n${escapeHtml(content)}` : '';
    }).filter(content => content).join('\n\n');
    
    studentActivityPage1 = firstHalf.map((process, index) => {
      const content = process.studentActivity || '';
      return content ? `【环节${index + 1}】\n${escapeHtml(content)}` : '';
    }).filter(content => content).join('\n\n');
    
    designIntentPage1 = firstHalf.map((process, index) => {
      const content = process.designIntent || '';
      return content ? `【环节${index + 1}】\n${escapeHtml(content)}` : '';
    }).filter(content => content).join('\n\n');
    
    // 生成第二页内容
    teachingProcessPage2 = secondHalf.map((process, index) => {
      const content = process.teacherActivity || '';
      return content ? `【环节${firstHalf.length + index + 1}】\n${escapeHtml(content)}` : '';
    }).filter(content => content).join('\n\n');
    
    studentActivityPage2 = secondHalf.map((process, index) => {
      const content = process.studentActivity || '';
      return content ? `【环节${firstHalf.length + index + 1}】\n${escapeHtml(content)}` : '';
    }).filter(content => content).join('\n\n');
    
    designIntentPage2 = secondHalf.map((process, index) => {
      const content = process.designIntent || '';
      return content ? `【环节${firstHalf.length + index + 1}】\n${escapeHtml(content)}` : '';
    }).filter(content => content).join('\n\n');
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
        height: 1123px;
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
    .info-section {
        width: 60%;
        margin: 0 auto;
        text-align: left;
    }
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
    .info-line .line {
        flex-grow: 1;
        border-bottom: 1px solid #465d87;
        margin-left: 10px;
    }
    .info-line .line-content {
        flex-grow: 1;
        border-bottom: 1px solid #465d87;
        margin-left: 10px;
        padding-left: 10px;
        min-height: 1.2em;
    }

    .toc-page {
        display: flex;
        flex-direction: column;
    }
    
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

    .content-table th {
        font-weight: normal;
        height: 40px;
        background-color: #fff;
    }
    .content-table td {
        height: 40px;
    }
    .content-table .col-seq { 
        width: 12%;
        text-align: center;
    }
    .content-table .col-title { 
        width: 68%;
        text-align: left;
        padding-left: 15px;
    }
    .content-table .col-page { 
        width: 20%;
        text-align: center;
    }

    .detail-table {
        table-layout: fixed;
        margin-top: 20px;
    }

    .detail-table td {
        vertical-align: middle;
        padding: 8px;
    }
    .detail-table .row-header {
        font-weight: normal;
        width: 120px;
        height: auto;
        padding: 8px;
        text-align: center;
        letter-spacing: 5px;
        white-space: nowrap;
        vertical-align: middle;
    }
    
    .detail-table tr:first-child td:nth-child(2) {
        width: auto;
    }
    .detail-table tr:first-child td:last-child {
        width: 200px;
    }
    .detail-table .nested-table {
        width: 100%;
        height: 100%;
        border-collapse: collapse;
        margin: 0;
    }
    .detail-table .nested-table td {
        border: none;
        border-bottom: 1px solid #000;
        padding: 8px;
        text-align: left;
        vertical-align: middle;
        font-size: 16px;
    }
    .detail-table .nested-table tr:last-child td {
        border-bottom: none;
    }
    .detail-table .nested-table .label {
        width: 45%;
        border-right: 1px solid #000;
        text-align: center;
        letter-spacing: 3px;
    }
    .detail-table .nested-table .value {
        width: 55%;
        text-align: left;
        padding-left: 10px;
    }
    .detail-table tr:nth-child(1) { height: 50px; }
    .detail-table tr:nth-child(2) { height: 100px; }
    .detail-table tr:nth-child(3) { height: 160px; }
    .detail-table tr:nth-child(4) { height: 80px; }
    .detail-table tr:nth-child(5) { height: 80px; }
    .detail-table tr:nth-child(6) { height: 180px; }
    .detail-table tr:nth-child(7) { height: 100px; }
    .detail-table tr:nth-child(8) { height: 80px; }

    .process-page-container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        width: 100%;
    }

    .process-table-main {
        width: 100%;
        height: 100%;
        border-collapse: collapse;
        border: 2px solid #000;
        table-layout: fixed;
    }

    .process-table-main thead th {
        height: 45px;
        background-color: #fff;
        font-weight: normal;
        border: 1px solid #000;
        padding: 8px;
        text-align: center;
        font-size: 18px;
        box-sizing: border-box;
    }

    .process-table-main thead tr:first-child th {
        font-size: 18px;
        letter-spacing: 2px;
    }

    .process-table-main thead tr:last-child th:nth-child(1) {
        width: 33.33%;
    }
    
    .process-table-main thead tr:last-child th:nth-child(2) {
        width: 33.34%;
    }
    
    .process-table-main thead tr:last-child th:nth-child(3) {
        width: 33.33%;
    }

    .process-table-main tbody tr {
        height: 100%;
    }

    .process-table-main tbody td {
        border: 1px solid #000;
        padding: 12px;
        vertical-align: top;
        text-align: left;
        font-size: 16px;
        line-height: 1.6;
        box-sizing: border-box;
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: pre-wrap;
        text-indent: 0;
        letter-spacing: 0.5px;
    }

    .process-table-main tbody td:nth-child(1) {
        width: 33.33%;
    }
    
    .process-table-main tbody td:nth-child(2) {
        width: 33.34%;
    }
    
    .process-table-main tbody td:nth-child(3) {
        width: 33.33%;
    }

    .process-table-footer {
        width: 100%;
        border-collapse: collapse;
        border: 2px solid #000;
        border-top: none;
        margin-top: -2px;
        table-layout: fixed;
    }

    .process-table-footer td {
        border: 1px solid #000;
        padding: 10px;
        text-align: left;
        font-size: 18px;
        vertical-align: top;
        line-height: 1.8;
        box-sizing: border-box;
        white-space: pre-wrap;
    }

    .process-table-footer .row-header {
        width: 120px;
        text-align: center;
        letter-spacing: 5px;
        white-space: nowrap;
        vertical-align: middle;
    }
    
    .process-table-footer .footer-content {
        height: 120px;
        text-align: left;
    }

    .page-footer {
        display: none;
    }

    @page {
        size: A4;
        margin: 0;
    }

    @media print {
        body {
            padding: 0;
            background-color: white;
        }
        .page {
            border: none;
            margin: 0;
            page-break-after: always;
            box-shadow: none;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .page:last-child {
            page-break-after: auto;
        }
    }

    .detail-table td:not(.row-header) {
        text-align: left;
        line-height: 1.8;
    }

    * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    table {
        border-spacing: 0;
    }

    .detail-table td[colspan] {
        min-height: 30px;
    }
</style>
</head>
<body>

<div class="page">
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

<div class="page toc-page">
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
    <div class="process-page-container">
        <table class="process-table-main">
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
                    <td>${teachingProcessPage1 || ''}</td>
                    <td>${studentActivityPage1 || ''}</td>
                    <td>${designIntentPage1 || ''}</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<div class="page">
    <div class="process-page-container">
        <table class="process-table-main">
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
                    <td>${teachingProcessPage2 || ''}</td>
                    <td>${studentActivityPage2 || ''}</td>
                    <td>${designIntentPage2 || ''}</td>
                </tr>
            </tbody>
        </table>
        <table class="process-table-footer">
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
</div>

</body>
</html>`;
}

/**
 * HTML转义函数,防止XSS攻击
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

