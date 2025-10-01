/**
 * 厦门市第九中学教案本 - JavaScript交互文件
 */

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initDateDisplay();
  initFormPersistence();
  initSmoothScroll();
  initAIGeneration();
});

/**
 * 初始化导航栏高亮效果
 */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  
  // 监听滚动事件，更新导航栏激活状态
  window.addEventListener('scroll', function() {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
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
}

/**
 * 初始化日期显示
 */
function initDateDisplay() {
  const dateElement = document.querySelector('.cover .text-lg p');
  if (dateElement) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[now.getDay()];
    
    dateElement.textContent = `当前日期：${year}年${month}月${day}日 ${weekday}`;
  }
}

/**
 * 初始化表单数据持久化（使用localStorage）
 */
function initFormPersistence() {
  // 获取所有需要持久化的输入框
  const formInputs = document.querySelectorAll('input[type="text"], textarea');
  
  // 从localStorage加载数据
  formInputs.forEach(input => {
    if (input.id) {
      const savedValue = localStorage.getItem(`lessonPlan_${input.id}`);
      if (savedValue) {
        input.value = savedValue;
      }
    }
  });
  
  // 监听输入变化，自动保存到localStorage
  formInputs.forEach(input => {
    if (input.id) {
      input.addEventListener('input', function() {
        localStorage.setItem(`lessonPlan_${input.id}`, this.value);
      });
    }
  });
}

/**
 * 初始化平滑滚动
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // 获取导航栏高度
        const nav = document.querySelector('nav');
        const navHeight = nav ? nav.offsetHeight : 0;
        
        // 计算目标位置，考虑导航栏高度
        const targetPosition = targetElement.offsetTop - navHeight;
        
        // 平滑滚动到计算后的位置
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * 清除所有保存的表单数据
 */
function clearAllData() {
  if (confirm('确定要清除所有保存的数据吗？此操作不可恢复。')) {
    localStorage.clear();
    location.reload();
  }
}

/**
 * 导出教案数据为JSON
 */
function exportData() {
  const data = {};
  const formInputs = document.querySelectorAll('input[type="text"], textarea');
  
  formInputs.forEach(input => {
    if (input.id) {
      data[input.id] = input.value;
    }
  });
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `教案数据_${new Date().getTime()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * 导入教案数据
 */
function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        try {
          const data = JSON.parse(event.target.result);
          Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
              element.value = data[key];
              localStorage.setItem(`lessonPlan_${key}`, data[key]);
            }
          });
          alert('数据导入成功！');
        } catch (error) {
          alert('数据导入失败，请确保文件格式正确。');
          console.error('导入错误：', error);
        }
      };
      reader.readAsText(file);
    }
  };
  
  input.click();
}

/**
 * 打印教案
 */
function printLessonPlan() {
  window.print();
}

/**
 * 导出教案为HTML格式
 * 参考旧版本模板格式，生成完整的HTML文档
 */
function exportLessonPlanToHTML() {
  try {
    // 获取所有教案数据
    const lessonData = collectLessonData();
    
    // 生成HTML内容
    const htmlContent = generateHTMLTemplate(lessonData);
    
    // 创建Blob并下载
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 生成文件名
    const subject = lessonData.subject || '学科';
    const grade = lessonData.grade || '年级';
    const lessonTopic = lessonData.lessonTopic || '课题';
    const date = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');
    link.download = `厦门九中教案_${subject}_${grade}_${lessonTopic}_${date}.html`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('教案导出成功！');
  } catch (error) {
    console.error('HTML导出失败:', error);
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
  const lessonTextareas = document.querySelectorAll('#lesson .grid textarea');
  data.blackboardDesign = lessonTextareas[0]?.value?.trim() || '';
  data.reflection = lessonTextareas[1]?.value?.trim() || '';
  
  return data;
}

/**
 * 生成HTML模板
 * 参考旧版本的模板格式
 */
function generateHTMLTemplate(data) {
  const currentDate = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // 生成教学过程HTML
  let teachingProcessHTML = '';
  if (data.teachingProcess && data.teachingProcess.length > 0) {
    data.teachingProcess.forEach((process, index) => {
      teachingProcessHTML += `
            <tr>
              <td style="border: 1px solid #ddd; padding: 15px; text-align: left; vertical-align: top; background-color: #f8f9fa; font-weight: bold; color: #495057; width: 20%;">环节 ${index + 1}</td>
              <td style="border: 1px solid #ddd; padding: 15px; text-align: left; vertical-align: top; color: #212529;">
                <strong>教师活动：</strong><br>${process.teacherActivity || ''}<br><br>
                <strong>学生活动：</strong><br>${process.studentActivity || ''}<br><br>
                <strong>设计意图：</strong><br>${process.designIntent || ''}
              </td>
            </tr>`;
    });
  }
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>厦门市第九中学教案 - ${data.lessonTopic || '教案'}</title>
    <style>
        body { 
            font-family: 'Segoe UI', 'Microsoft YaHei', Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background-color: #f5f5f5; 
            line-height: 1.6; 
        }
        .container { 
            max-width: 900px; 
            margin: 0 auto; 
            background: white; 
            padding: 40px; 
            border-radius: 8px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
        }
        .title { 
            text-align: center; 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 30px; 
            color: #2c3e50; 
            border-bottom: 2px solid #3498db; 
            padding-bottom: 15px; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
            background: white; 
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 15px; 
            text-align: left; 
            vertical-align: top; 
        }
        th { 
            background-color: #f8f9fa; 
            font-weight: bold; 
            color: #495057; 
            width: 20%; 
        }
        td { 
            color: #212529; 
            min-height: 60px; 
        }
        .content-cell { 
            white-space: pre-line; 
            line-height: 1.8; 
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin: 20px 0 10px 0;
            border-left: 4px solid #3498db;
            padding-left: 10px;
        }
        .footer { 
            text-align: right; 
            margin-top: 30px; 
            font-size: 14px; 
            color: #6c757d; 
            font-style: italic; 
        }
        .empty-content {
            color: #999;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="title">厦门市第九中学教案</div>
        
        <table>
            <tr>
                <th>学 科</th>
                <td>${data.subject || '<span class="empty-content">未填写</span>'}</td>
                <th>年 级</th>
                <td>${data.grade || '<span class="empty-content">未填写</span>'}</td>
            </tr>
            <tr>
                <th>班 级</th>
                <td>${data.class || '<span class="empty-content">未填写</span>'}</td>
                <th>学年度</th>
                <td>${data.academicYear || '<span class="empty-content">未填写</span>'}</td>
            </tr>
            <tr>
                <th>教 师</th>
                <td>${data.teacher || '<span class="empty-content">未填写</span>'}</td>
                <th>备课时间</th>
                <td>${data.prepareTime || currentDate}</td>
            </tr>
            <tr>
                <th>课 题</th>
                <td colspan="3">${data.lessonTopic || '<span class="empty-content">未填写</span>'}</td>
            </tr>
            <tr>
                <th>课时数</th>
                <td colspan="3">${data.classHours || '<span class="empty-content">未填写</span>'}</td>
            </tr>
        </table>

        <div class="section-title">课标要求</div>
        <table>
            <tr>
                <td colspan="4" class="content-cell">${data.curriculumRequire || '<span class="empty-content">未填写课标要求</span>'}</td>
            </tr>
        </table>

        <div class="section-title">素养目标</div>
        <table>
            <tr>
                <td colspan="4" class="content-cell">${data.literacyTarget || '<span class="empty-content">未填写素养目标</span>'}</td>
            </tr>
        </table>

        <div class="section-title">教学重点</div>
        <table>
            <tr>
                <td colspan="4" class="content-cell">${data.keyPoints || '<span class="empty-content">未填写教学重点</span>'}</td>
            </tr>
        </table>

        <div class="section-title">教学难点</div>
        <table>
            <tr>
                <td colspan="4" class="content-cell">${data.difficultPoints || '<span class="empty-content">未填写教学难点</span>'}</td>
            </tr>
        </table>

        <div class="section-title">学情分析</div>
        <table>
            <tr>
                <td colspan="4" class="content-cell">${data.studentAnalysis || '<span class="empty-content">未填写学情分析</span>'}</td>
            </tr>
        </table>

        <div class="section-title">教学策略</div>
        <table>
            <tr>
                <td colspan="4" class="content-cell">${data.teachingStrategy || '<span class="empty-content">未填写教学策略</span>'}</td>
            </tr>
        </table>

        <div class="section-title">教学资源</div>
        <table>
            <tr>
                <td colspan="4" class="content-cell">${data.teachingResources || '<span class="empty-content">未填写教学资源</span>'}</td>
            </tr>
        </table>

        <div class="section-title">教学过程</div>
        <table>
            ${teachingProcessHTML || '<tr><td colspan="2" style="text-align: center; color: #999; font-style: italic;">未填写教学过程</td></tr>'}
        </table>

        <div class="section-title">板书设计</div>
        <table>
            <tr>
                <td colspan="4" class="content-cell">${data.blackboardDesign || '<span class="empty-content">未填写板书设计</span>'}</td>
            </tr>
        </table>

        <div class="section-title">教学反思</div>
        <table>
            <tr>
                <td colspan="4" class="content-cell">${data.reflection || '<span class="empty-content">未填写教学反思</span>'}</td>
            </tr>
        </table>

        <div class="footer">厦门市第九中学教案本 | 导出时间：${currentDate}</div>
    </div>
</body>
</html>`;
}

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
  
  // 绑定导出HTML按钮事件
  const exportHtmlBtn = document.getElementById('export-html-btn');
  if (exportHtmlBtn) {
    exportHtmlBtn.addEventListener('click', () => exportLessonPlanToHTML());
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
          if (textareas[0]) textareas[0].value = process.teacherActivity || '';
          if (textareas[1]) textareas[1].value = process.studentActivity || '';
          if (textareas[2]) textareas[2].value = process.designIntent || '';
        }
      });
    }
  }
  
  // 填充板书设计和教学反思
  const blackboardTextareas = document.querySelectorAll('#lesson .grid textarea');
  if (blackboardTextareas[0] && content.blackboardDesign) {
    blackboardTextareas[0].value = content.blackboardDesign;
  }
  if (blackboardTextareas[1] && content.reflection) {
    blackboardTextareas[1].value = content.reflection;
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
  
  alert('所有内容已清空！');
}

