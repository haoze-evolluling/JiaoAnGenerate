class LessonPlanGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.generatedContent = '';
    }

    initializeElements() {
        this.timeInput = document.getElementById('timeInput');
        this.classInput = document.getElementById('classInput');
        this.teacherInput = document.getElementById('teacherInput');
        this.hostInput = document.getElementById('hostInput');
        this.themeInput = document.getElementById('themeInput');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.generateBtn = document.getElementById('generateBtn');
        this.loading = document.getElementById('loading');
        this.actionButtons = document.getElementById('actionButtons');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');

        // 预览元素
        this.previewTime = document.getElementById('previewTime');
        this.previewClass = document.getElementById('previewClass');
        this.previewTeacher = document.getElementById('previewTeacher');
        this.previewHost = document.getElementById('previewHost');
        this.previewTheme = document.getElementById('previewTheme');
        this.previewGoals = document.getElementById('previewGoals');
        this.previewProcess = document.getElementById('previewProcess');
        this.previewReflection = document.getElementById('previewReflection');

        // 设置默认API密钥
        this.setDefaultApiKey();
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateLessonPlan());
        this.copyBtn.addEventListener('click', () => this.copyContent());
        this.downloadBtn.addEventListener('click', () => this.downloadHTMLContent());

        // 实时预览更新
        [this.timeInput, this.classInput, this.teacherInput, this.hostInput, this.themeInput].forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });
    }

    validateInputs() {
        const inputs = [
            { element: this.timeInput, name: '时间' },
            { element: this.classInput, name: '班级' },
            { element: this.teacherInput, name: '班主任' },
            { element: this.hostInput, name: '主持人' },
            { element: this.themeInput, name: '主题' }
        ];

        for (let input of inputs) {
            if (!input.element.value.trim()) {
                alert(`请输入${input.name}`);
                input.element.focus();
                return false;
            }
        }
        return true;
    }

    async generateLessonPlan() {
        if (!this.validateInputs()) return;

        this.generateBtn.disabled = true;
        this.loading.style.display = 'block';
        this.actionButtons.style.display = 'none';

        try {
            const formData = {
                time: this.timeInput.value,
                class: this.classInput.value,
                teacher: this.teacherInput.value,
                host: this.hostInput.value,
                theme: this.themeInput.value
            };

            const generatedContent = await this.callDeepSeekAPI(formData);
            this.generatedContent = generatedContent;
            
            // 更新预览（生成的内容将在预览区域显示）
            this.updatePreviewWithGeneratedContent(generatedContent);
            
            // 显示操作按钮
            this.actionButtons.style.display = 'flex';

        } catch (error) {
            alert('生成失败，请重试');
            console.error('生成错误:', error);
        } finally {
            this.generateBtn.disabled = false;
            this.loading.style.display = 'none';
        }
    }

    async callDeepSeekAPI(formData) {
        // 获取用户输入的API密钥
        const apiKey = this.apiKeyInput.value.trim();
        
        // 验证API密钥
        if (!apiKey) {
            throw new Error('请输入API密钥');
        }
        
        const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
        const prompt = this.generatePrompt(formData);
        
        try {
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
                            content: '你是一个专业的中学教案编写助手，专门帮助老师生成高质量的主题班会教案。请根据提供的信息生成详细、实用的教案内容。'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('DeepSeek API调用错误:', error);
            throw error;
        }
    }

    generatePrompt(formData) {
        return `请为厦门市第九中学生成一份主题班会教案，要求如下：

基本信息：
- 时间：${this.formatDateTime(formData.time)}
- 班级：${formData.class}
- 班主任：${formData.teacher}
- 主持人：${formData.host}
- 主题：${formData.theme}

教案内容要求：
1. 教案内容需确保详实完整，字数应尽可能丰富
2. 严格保证内容的严谨性，符合中学德育教育标准
3. 教育目标要具体明确，具有可衡量性和可操作性
4. 过程内容要详细具体，包含完整的时间安排、活动步骤和教学方法
5. 每个环节都要有具体的实施细节和指导要点
6. 内容要具有教育意义和实用价值

请直接生成完整的HTML格式教案内容，使用以下HTML结构：

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>厦门市第九中学主题班会课记录表</title>
    <style>
        body { font-family: 'Segoe UI', 'Microsoft YaHei', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 30px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
        th, td { border: 1px solid #ddd; padding: 15px; text-align: left; vertical-align: top; }
        th { background-color: #f8f9fa; font-weight: bold; color: #495057; width: 20%; }
        td { color: #212529; min-height: 60px; }
        .footer { text-align: right; margin-top: 30px; font-size: 14px; color: #6c757d; font-style: italic; }
        .content-cell { white-space: pre-line; line-height: 1.8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="title">厦门市第九中学主题班会课记录表</div>
        <table>
            <tr>
                <th>时  间</th>
                <td>${this.formatDateTime(formData.time)}</td>
                <th>班  级</th>
                <td>${formData.class}</td>
            </tr>
            <tr>
                <th>班主任</th>
                <td>${formData.teacher}</td>
                <th>主持人</th>
                <td>${formData.host}</td>
            </tr>
            <tr>
                <th>主  题</th>
                <td colspan="3">${formData.theme}</td>
            </tr>
            <tr>
                <th>教育目标</th>
                <td colspan="3" class="content-cell">（请生成3个具体的教育目标，每个目标单独一行）</td>
            </tr>
            <tr>
                <th>过程内容</th>
                <td colspan="3" class="content-cell">（请生成详细的班会流程，包括时间安排和具体活动内容）</td>
            </tr>
            <tr>
                <th>收获反思</th>
                <td colspan="3" class="content-cell">（请生成班会后的总结反思，体现教育效果和意义）</td>
            </tr>
        </table>
        <div class="footer">厦门九中德育处制</div>
    </div>
</body>
</html>

要求：
1. 返回的内容必须是完整的HTML文档，包含所有标签
2. 教育目标要具体、可衡量，每个目标单独一行
3. 过程内容要详细，包含具体的活动安排和时间分配
4. 收获反思要有深度，体现教育效果
5. 内容要符合中学德育教育要求
6. 语言要规范、专业`;
    }



    formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    setDefaultApiKey() {
        // 设置默认API密钥
        const defaultApiKey = 'sk-0560c9a849694436a71c1ef4c053505a';
        if (this.apiKeyInput && !this.apiKeyInput.value) {
            this.apiKeyInput.value = defaultApiKey;
        }
    }

    updatePreview() {
        this.previewTime.textContent = this.timeInput.value ? this.formatDateTime(this.timeInput.value) : '-';
        this.previewClass.textContent = this.classInput.value || '-';
        this.previewTeacher.textContent = this.teacherInput.value || '-';
        this.previewHost.textContent = this.hostInput.value || '-';
        this.previewTheme.textContent = this.themeInput.value || '-';
    }

    updatePreviewWithGeneratedContent(content) {
        // 创建临时DOM元素来解析HTML内容
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        
        // 从HTML表格中提取预览信息
        const table = doc.querySelector('table');
        if (table) {
            const rows = table.querySelectorAll('tr');
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('th, td');
                if (cells.length >= 2) {
                    const header = cells[0].textContent.trim();
                    const value = cells[1].textContent.trim();
                    
                    switch (header) {
                        case '教育目标':
                            this.previewGoals.textContent = value;
                            break;
                        case '过程内容':
                            this.previewProcess.textContent = value;
                            break;
                        case '收获反思':
                            this.previewReflection.textContent = value;
                            break;
                    }
                }
            });
        }

        this.updatePreview();
    }

    copyContent() {
        if (this.generatedContent) {
            // 提取预览区域的内容进行复制
            const previewContent = this.extractPreviewContent();
            navigator.clipboard.writeText(previewContent).then(() => {
                alert('内容已复制到剪贴板');
            }).catch(err => {
                alert('复制失败，请手动复制');
                console.error('复制错误:', err);
            });
        } else {
            alert('没有可复制的内容');
        }
    }

    downloadHTMLContent() {
        try {
            // 直接使用生成的HTML内容
            const htmlContent = this.generatedContent;
            
            // 创建Blob并下载
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `教案_${this.classInput.value}_${this.themeInput.value}_${new Date().toLocaleDateString()}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('HTML文件生成错误:', error);
            alert('HTML文件生成出错，请重试');
        }
    }

    extractPreviewContent() {
        // 从预览区域提取格式化的内容
        const time = this.previewTime.textContent || '-';
        const className = this.previewClass.textContent || '-';
        const teacher = this.previewTeacher.textContent || '-';
        const host = this.previewHost.textContent || '-';
        const theme = this.previewTheme.textContent || '-';
        const goals = this.previewGoals.textContent || '-';
        const process = this.previewProcess.textContent || '-';
        const reflection = this.previewReflection.textContent || '-';

        return `厦门市第九中学主题班会课记录表

时间：${time}
班级：${className}
班主任：${teacher}
主持人：${host}
主题：${theme}

教育目标：
${goals}

过程内容：
${process}

收获反思：
${reflection}`;
    }

    parseGeneratedContent() {
        let content = {
            time: '',
            className: '',
            teacher: '',
            host: '',
            theme: '',
            goals: '',
            process: '',
            reflection: ''
        };

        // 创建临时DOM元素来解析HTML内容
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.generatedContent, 'text/html');
        
        // 从HTML表格中提取信息
        const table = doc.querySelector('table');
        if (table) {
            const rows = table.querySelectorAll('tr');
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('th, td');
                if (cells.length >= 2) {
                    const header = cells[0].textContent.trim();
                    const value = cells[1].textContent.trim();
                    
                    switch (header) {
                        case '时  间':
                            content.time = value;
                            if (cells.length >= 4) content.className = cells[3].textContent.trim();
                            break;
                        case '班主任':
                            content.teacher = value;
                            if (cells.length >= 4) content.host = cells[3].textContent.trim();
                            break;
                        case '主  题':
                            content.theme = value;
                            break;
                        case '教育目标':
                            content.goals = value;
                            break;
                        case '过程内容':
                            content.process = value;
                            break;
                        case '收获反思':
                            content.reflection = value;
                            break;
                    }
                }
            });
        }

        return content;
    }


}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new LessonPlanGenerator();
});