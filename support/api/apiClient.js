// support/api/apiClient.js
// Centralised HTTP client for all API tests.
// Wraps axios — add auth headers, logging, and timeout in one place.

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'https://staging.pricefirst.com';
const TIMEOUT  = parseInt(process.env.API_TIMEOUT || '10000', 10);

// ─── create a shared axios instance ──────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json'
  }
});

// ─── request interceptor: log every outgoing call ────────────────────────────
apiClient.interceptors.request.use((config) => {
  console.log(`\n🌐 API REQUEST  → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  if (config.params) console.log('   params :', JSON.stringify(config.params));
  if (config.data)   console.log('   body   :', JSON.stringify(config.data));
  return config;
});

// ─── response interceptor: log status + pass errors through ──────────────────
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API RESPONSE ← ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // axios throws on 4xx/5xx — we still want the response object in our tests
    if (error.response) {
      console.log(`⚠️  API ERROR   ← ${error.response.status} ${error.config?.url}`);
      return Promise.resolve(error.response);   // return the response, don't throw
    }
    console.error('❌ Network error:', error.message);
    throw error;
  }
);

// ─── helper methods ──────────────────────────────────────────────────────────

/**
 * GET  /api/search?q=keyword
 */
async function searchDevices(keyword) {
  return apiClient.get('/api/search', { params: { q: keyword } });
}

/**
 * GET  /api/search   (no params — for negative test)
 */
async function searchNoParams() {
  return apiClient.get('/api/search');
}

/**
 * GET  /api/offers?slug=device-slug&condition=Excellent
 */
async function getOffers(slug, condition = null) {
  const params = { slug };
  if (condition) params.condition = condition;
  return apiClient.get('/api/offers', { params });
}

/**
 * POST /api/checkout
 */
async function submitCheckout(payload) {
  return apiClient.post('/api/checkout', payload);
}

module.exports = {
  apiClient,
  searchDevices,
  searchNoParams,
  getOffers,
  submitCheckout
};