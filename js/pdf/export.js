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
