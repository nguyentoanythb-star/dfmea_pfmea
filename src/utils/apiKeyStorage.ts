const API_KEY_STORAGE_KEY = 'fmea_gemini_api_key';

/**
 * Lấy Gemini API Key đã lưu trong Local Storage
 */
export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY)?.trim() || '';
  } catch {
    return '';
  }
}

/**
 * Lưu Gemini API Key vào Local Storage
 */
export function setStoredApiKey(key: string): void {
  try {
    if (!key || !key.trim()) {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    } else {
      localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
    }
    // Phát event để các component lắng nghe cập nhật realtime
    window.dispatchEvent(new Event('fmea_api_key_changed'));
  } catch (err) {
    console.error('Lỗi khi lưu API Key:', err);
  }
}

/**
 * Xóa Gemini API Key khỏi Local Storage
 */
export function removeStoredApiKey(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    window.dispatchEvent(new Event('fmea_api_key_changed'));
  } catch (err) {
    console.error('Lỗi khi xóa API Key:', err);
  }
}

/**
 * Kiểm tra xem người dùng đã cấu hình API Key riêng hay chưa
 */
export function hasStoredApiKey(): boolean {
  return Boolean(getStoredApiKey());
}

/**
 * Làm mờ API Key hiển thị (VD: AIzaSyB...9x7Q)
 */
export function maskApiKey(key: string): string {
  if (!key) return '';
  if (key.length <= 10) return '••••••••••';
  return `${key.slice(0, 7)}••••••••${key.slice(-4)}`;
}
