import { getConfig } from '../utils/config-loader.js';

const CONFIG = getConfig();

export function init() {
  addControls();
}

function addControls() {
  const container = document.querySelector('#lesson .overflow-x-auto');
  if (!container) return;

  const controls = document.createElement('div');
  controls.className = 'flex gap-3 mb-3';
  controls.innerHTML = `
    <button id="add-row-btn" class="px-4 py-2 text-sm font-semibold text-white" style="background: var(--color-primary); cursor: pointer;">
      <i class="fas fa-plus mr-1"></i> 添加环节
    </button>
    <button id="remove-row-btn" class="px-4 py-2 text-sm font-semibold text-white" style="background: var(--color-accent); cursor: pointer;">
      <i class="fas fa-minus mr-1"></i> 删除环节
    </button>
  `;

  container.insertBefore(controls, container.querySelector('table'));

  document.getElementById('add-row-btn')?.addEventListener('click', addRow);
  document.getElementById('remove-row-btn')?.addEventListener('click', removeRow);
}

function addRow() {
  const tbody = document.querySelector('#lesson table tbody');
  if (!tbody) return;

  const templateRow = tbody.querySelector('tr');
  if (!templateRow) return;

  const newRow = templateRow.cloneNode(true);
  newRow.querySelectorAll('textarea').forEach(ta => { ta.value = ''; });
  tbody.appendChild(newRow);

  bindRowPersistence(newRow);
}

function removeRow() {
  const tbody = document.querySelector('#lesson table tbody');
  if (!tbody) return;
  if (tbody.querySelectorAll('tr').length <= 1) {
    alert('至少保留一个教学环节');
    return;
  }
  tbody.removeChild(tbody.lastElementChild);
}

function bindRowPersistence(row) {
  const prefix = CONFIG.STORAGE_PREFIX + 'teachingProcess_';
  const tbody = row.closest('tbody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  const rowIndex = Array.from(rows).indexOf(row);

  row.querySelectorAll('textarea').forEach((ta, colIndex) => {
    ta.addEventListener('input', () => {
      localStorage.setItem(`${prefix}${rowIndex}_${colIndex}`, ta.value);
    });
  });
}
