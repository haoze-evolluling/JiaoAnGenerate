import { CONFIG } from '../../config.js';

// 提供默认值兜底，防止 config.js 缺失
const DEFAULTS = {
  API_BASE_URL: 'https://api.deepseek.com/v1',
  API_MODEL: 'deepseek-chat',
  API_TEMPERATURE: 0.7,
  API_MAX_TOKENS: 4000,
  DEFAULT_TOPIC_PREFIX: '教学',
  STORAGE_PREFIX: 'lessonPlan_',
};

export function getConfig() {
  return { ...DEFAULTS, ...CONFIG };
}
