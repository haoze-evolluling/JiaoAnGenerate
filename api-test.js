// 测试DeepSeek API集成的简单示例
// 这个文件可以用于测试API连接

async function testDeepSeekAPI() {
    const apiKey = prompt('请输入DeepSeek API密钥进行测试：');
    if (!apiKey) {
        console.log('未提供API密钥，取消测试');
        return;
    }

    const testPrompt = "请用一句话介绍厦门市第九中学的主题班会教案生成系统";
    
    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
                        content: '你是一个专业的中学教案编写助手'
                    },
                    {
                        role: 'user',
                        content: testPrompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 100
            })
        });

        if (!response.ok) {
            throw new Error(`API调用失败: ${response.status}`);
        }

        const data = await response.json();
        console.log('API测试成功！');
        console.log('返回内容：', data.choices[0].message.content);
        alert('API连接成功！请查看控制台输出。');
        
    } catch (error) {
        console.error('API测试失败：', error);
        alert('API连接失败，请检查密钥和网络连接。');
    }
}

// 添加到全局作用域供控制台调用
window.testDeepSeekAPI = testDeepSeekAPI;
console.log('测试函数已加载，在控制台输入 testDeepSeekAPI() 开始测试');