window.ApiClient = (() => {
  const TOKEN_KEY = 'portfolio_admin_token';

  const getToken = () => sessionStorage.getItem(TOKEN_KEY) || '';
  const setToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);
  const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

  const request = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const token = getToken();
    if (options.auth && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = { success: false, message: 'Unexpected server response' };
    }

    if (!response.ok) {
      const error = new Error(payload?.message || `Request failed (${response.status})`);
      error.status = response.status;
      error.errors = payload?.errors || [];
      throw error;
    }

    return payload;
  };

  const isSafeUrl = (url) => {
    if (!url) return false;
    try {
      const parsed = new URL(url, window.location.origin);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  return {
    getToken,
    setToken,
    clearToken,
    request,
    isSafeUrl,
  };
})();
