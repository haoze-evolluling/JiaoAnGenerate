// 验证脚本 - 检查导出功能修改是否正确
console.log("开始验证修改...");

// 检查是否移除了Word导出库
const hasDocxLibrary = typeof docx !== 'undefined';
const hasFileSaver = typeof saveAs !== 'undefined';

console.log("Word导出库状态:", hasDocxLibrary ? "仍然存在" : "已移除");
console.log("FileSaver库状态:", hasFileSaver ? "仍然存在" : "已移除");

// 检查新的HTML导出功能是否存在
const scriptContent = document.querySelector('script[src="script.js"]');
if (scriptContent) {
    console.log("script.js已正确加载");
} else {
    console.log("script.js未找到");
}

// 检查按钮文本是否已更新
const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) {
    console.log("下载按钮文本:", downloadBtn.textContent);
    console.log("下载按钮HTML:", downloadBtn.innerHTML);
} else {
    console.log("下载按钮未找到");
}

// 检查格式选择器是否已移除
const formatSelector = document.getElementById('formatSelector');
console.log("格式选择器状态:", formatSelector ? "仍然存在" : "已移除");

console.log("验证完成！");