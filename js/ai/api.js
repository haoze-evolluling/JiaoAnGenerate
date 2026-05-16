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

  let jsonContent = content.trim();
  if (jsonContent.startsWith('```json')) {
    jsonContent = jsonContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/```\n?/, '').replace(/\n?```$/, '');
  }

  return JSON.parse(jsonContent);
}
