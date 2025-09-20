// UI界面测试脚本
function testUIFunctionality() {
    console.log('开始测试UI界面功能...');
    
    // 测试1: 检查操作区域是否存在
    const actionButtons = document.getElementById('actionButtons');
    const loading = document.getElementById('loading');
    const outputSection = document.querySelector('.output-section');
    
    console.log('操作区域测试:');
    console.log('- 操作按钮区域存在:', !!actionButtons);
    console.log('- 加载状态存在:', !!loading);
    console.log('- 输出区域标题:', outputSection.querySelector('.section-title').textContent);
    
    // 测试2: 检查预览区域
    const previewSection = document.querySelector('.preview-section');
    const previewTable = document.querySelector('.preview-table');
    
    console.log('预览区域测试:');
    console.log('- 预览区域存在:', !!previewSection);
    console.log('- 预览表格存在:', !!previewTable);
    console.log('- 预览表格行数:', previewTable.querySelectorAll('tr').length);
    
    // 测试3: 模拟生成过程
    console.log('模拟生成过程...');
    
    // 填充表单数据
    document.getElementById('timeInput').value = '2024-01-15T14:30';
    document.getElementById('classInput').value = '高一(1)班';
    document.getElementById('teacherInput').value = '张老师';
    document.getElementById('hostInput').value = '李老师';
    document.getElementById('themeInput').value = '安全教育主题班会';
    
    console.log('表单数据已填充');
    
    // 测试4: 检查按钮状态
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    console.log('按钮状态测试:');
    console.log('- 生成按钮存在:', !!generateBtn);
    console.log('- 复制按钮存在:', !!copyBtn);
    console.log('- 下载按钮存在:', !!downloadBtn);
    
    console.log('UI界面测试完成！');
}

// 添加到全局作用域
window.testUIFunctionality = testUIFunctionality;
console.log('UI测试函数已加载，输入 testUIFunctionality() 开始测试');