import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api/',
});

const API_CACHE_PREFIX = 'ecd_api_cache:';
const API_CACHE_TTL_MS = 5 * 60 * 1000;
const AUTH_ACTIVE_USER_KEY = 'gt_active_auth_user';
const AUTH_LAST_ACTIVITY_KEY = 'gt_auth_last_activity';
const AUTH_LOGIN_AT_KEY = 'gt_auth_login_at';

const safeStorage = {
  getItem(key) {
    try {
      return sessionStorage.getItem(key);
    } catch (_) {
      return null;
    }
  },
  setItem(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch (_) {}
  },
  removeItem(key) {
    try {
      sessionStorage.removeItem(key);
    } catch (_) {}
  },
  keys() {
    try {
      return Object.keys(sessionStorage);
    } catch (_) {
      return [];
    }
  },
};

const buildCacheKey = (config, token) => {
  const params = config.params ? JSON.stringify(config.params) : '';
  const tokenScope = token ? String(token).slice(0, 16) : 'anon';
  return `${API_CACHE_PREFIX}${tokenScope}:${(config.method || 'get').toLowerCase()}:${config.url || ''}:${params}`;
};

const clearApiCache = () => {
  safeStorage.keys()
    .filter((key) => key.startsWith(API_CACHE_PREFIX))
    .forEach((key) => safeStorage.removeItem(key));
};

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  const method = (config.method || 'get').toLowerCase();

  if (method !== 'get') {
    clearApiCache();
    return config;
  }

  if (config.skipCache) {
    return config;
  }

  const cacheKey = buildCacheKey(config, token);
  const cached = safeStorage.getItem(cacheKey);
  if (cached) {
    try {
      const entry = JSON.parse(cached);
      if (entry && entry.timestamp && Date.now() - entry.timestamp < API_CACHE_TTL_MS) {
        config.adapter = async () => ({
          data: entry.data,
          status: entry.status,
          statusText: entry.statusText,
          headers: entry.headers || {},
          config,
          request: { fromCache: true },
        });
      } else {
        safeStorage.removeItem(cacheKey);
      }
    } catch (_) {
      safeStorage.removeItem(cacheKey);
    }
  }

  config.metadata = { ...(config.metadata || {}), cacheKey };
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearApiCache();
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      localStorage.removeItem(AUTH_ACTIVE_USER_KEY);
      localStorage.removeItem(AUTH_LAST_ACTIVITY_KEY);
      localStorage.removeItem(AUTH_LOGIN_AT_KEY);
    }
    return Promise.reject(error);
  }
);

API.interceptors.response.use((response) => {
  const method = (response.config?.method || 'get').toLowerCase();
  const cacheKey = response.config?.metadata?.cacheKey;

  if (method === 'get' && cacheKey && !response.config?.skipCache) {
    safeStorage.setItem(
      cacheKey,
      JSON.stringify({
        timestamp: Date.now(),
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      })
    );
  }

  return response;
});

export default API;
