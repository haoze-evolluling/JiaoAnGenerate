/**
 * 厦门市第九中学教案本 - JavaScript交互文件
 */

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initDateDisplay();
  initFormPersistence();
  initSmoothScroll();
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

