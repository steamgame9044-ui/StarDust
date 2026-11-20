const SESSION_STORAGE_KEY = 'stardust_session_token';

let currentCsrfToken = '';
let currentSessionToken =
  typeof window !== 'undefined' ? window.sessionStorage.getItem(SESSION_STORAGE_KEY) || '' : '';

export function setCsrfToken(token: string): void {
  if (token) {
    currentCsrfToken = token;
  }
}

export function setSessionToken(token: string): void {
  currentSessionToken = token || '';
  if (typeof window !== 'undefined') {
    if (token) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }
}

export function getSessionToken(): string {
  return currentSessionToken;
}

export async function ensureCsrfToken(forceRefresh = false): Promise<string> {
  if (currentCsrfToken && !forceRefresh) return currentCsrfToken;
  const headers: Record<string, string> = {};
  if (currentSessionToken) {
    headers['Authorization'] = `Bearer ${currentSessionToken}`;
  }
  const res = await fetch('/api/csrf', {
    credentials: 'same-origin',
    headers,
  });
  const data = await res.json().catch(() => ({}));
  currentCsrfToken = data.csrfToken || '';
  return currentCsrfToken;
}

export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (currentSessionToken) {
    headers['Authorization'] = `Bearer ${currentSessionToken}`;
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = await ensureCsrfToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  if (data.csrfToken) {
    setCsrfToken(data.csrfToken);
  }
  if (data.sessionToken) {
    setSessionToken(data.sessionToken);
  }
  return data as T;
}

/**
 * Converts any user-selected PNG/JPG/WebP image file in the browser into
 * an optimized WebP data URL (falling back to original format if WebP encoding isn't supported).
 */
export async function convertImageFileToWebpDataUrl(file: File, maxWidth = 1440): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const rawResult = String(reader.result);
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawResult);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const webpDataUrl = canvas.toDataURL('image/webp', 0.86);
        if (webpDataUrl.startsWith('data:image/webp')) {
          resolve(webpDataUrl);
        } else {
          resolve(rawResult);
        }
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  });
}

export async function safeCopyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below for restricted iframe permissions
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
