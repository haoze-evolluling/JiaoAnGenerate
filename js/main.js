import { init as initNav } from './core/navigation.js';
import { init as initDate } from './core/date.js';
import { init as initPersistence } from './core/persistence.js';
import { init as initGeneration } from './ai/generation.js';
import { init as initExport } from './pdf/export.js';
import { init as initTeachingProcess } from './ui/teaching-process.js';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initDate();
  initPersistence();
  initGeneration();
  initExport();
  initTeachingProcess();
});

import { clearFormData } from './core/persistence.js';
import { exportToJSON, importFromJSON } from './core/data.js';

window.clearAllData = () => {
  if (confirm('确定要清除所有保存的数据吗？此操作不可恢复。')) {
    clearFormData(false);
    location.reload();
  }
};
window.exportData = exportToJSON;
window.importData = importFromJSON;
window.printLessonPlan = () => window.print();
