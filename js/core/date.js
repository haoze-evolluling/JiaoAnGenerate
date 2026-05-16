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
