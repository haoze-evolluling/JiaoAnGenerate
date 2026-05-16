/**
 * XOR 混淆 + Base64 编解码工具
 * 密钥存于 sessionStorage，关闭标签页即销毁
 * 注意：这是轻量混淆，非真正加密
 */

export function generateKey(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < length; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export function encrypt(text, key) {
  if (!text) return '';
  if (!key || key.length === 0) { console.warn('crypto: encrypt called with empty key'); return ''; }
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(encodeURIComponent(result));
}

export function decrypt(encoded, key) {
  if (!encoded) return '';
  if (!key || key.length === 0) { console.warn('crypto: decrypt called with empty key'); return ''; }
  try {
    const decoded = decodeURIComponent(atob(encoded));
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch {
    console.warn('crypto: decryption failed');
    return '';
  }
}
