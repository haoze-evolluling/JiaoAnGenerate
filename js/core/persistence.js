import { getConfig } from '../utils/config-loader.js';
import { encrypt, decrypt, generateKey } from '../utils/crypto.js';

const CONFIG = getConfig();
const PREFIX = CONFIG.STORAGE_PREFIX;

function getCryptoKey() {
  let key = sessionStorage.getItem('_cryptoKey');
  if (!key) {
    key = generateKey();
    sessionStorage.setItem('_cryptoKey', key);
  }
  return key;
}

function saveItem(id, value) {
  let storedValue = value;
  if (id === 'api-key') {
    storedValue = encrypt(value, getCryptoKey());
  }
  localStorage.setItem(PREFIX + id, storedValue);
}

function loadItem(id) {
  const raw = localStorage.getItem(PREFIX + id);
  if (raw === null) return '';
  if (id === 'api-key') {
    return decrypt(raw, getCryptoKey());
  }
  return raw;
}

function removeItem(id) {
  localStorage.removeItem(PREFIX + id);
}

export function init() {
  document.querySelectorAll('input[type="text"], textarea, input[type="password"]').forEach(input => {
    if (!input.id) return;
    const saved = loadItem(input.id);
    if (saved) input.value = saved;

    input.addEventListener('input', () => {
      saveItem(input.id, input.value);
    });
  });

  loadTeachingProcess();
}

export function saveFormData() {
  document.querySelectorAll('input[type="text"], textarea, input[type="password"]').forEach(input => {
    if (input.id) saveItem(input.id, input.value);
  });
}

export function clearFormData(keepApiKey = true) {
  const all = document.querySelectorAll('input[type="text"], textarea');
  all.forEach(input => {
    if (keepApiKey && input.id === 'api-key') return;
    input.value = '';
    if (input.id) removeItem(input.id);
  });

  const prefix = PREFIX + 'teachingProcess_';
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

function loadTeachingProcess() {
  const tbody = document.querySelector('#lesson table tbody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  rows.forEach((row, rowIndex) => {
    const textareas = row.querySelectorAll('textarea');
    textareas.forEach((ta, colIndex) => {
      const saved = localStorage.getItem(PREFIX + `teachingProcess_${rowIndex}_${colIndex}`);
      if (saved) ta.value = saved;
      ta.addEventListener('input', () => {
        localStorage.setItem(PREFIX + `teachingProcess_${rowIndex}_${colIndex}`, ta.value);
      });
    });
  });
}
