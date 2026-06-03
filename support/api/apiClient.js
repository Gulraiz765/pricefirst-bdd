const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'https://staging.pricefirst.com';
const TIMEOUT = parseInt(process.env.API_TIMEOUT || '10000', 10);

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  console.log(`\n🌐 API REQUEST  → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  if (config.params && Object.keys(config.params).length) {
    console.log('   params :', JSON.stringify(config.params));
  }
  if (config.data && Object.keys(config.data).length) {
    console.log('   body   :', JSON.stringify(config.data));
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API RESPONSE ← ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.log(`⚠️  API ERROR   ← ${error.response.status} ${error.config?.url}`);
      return error.response;
    }
    console.error('❌ Network error:', error.message);
    throw error;
  }
);

async function searchProducts(query, limit = 50, from = 0) {
  console.log(`🔍 Searching products with query: "${query}"`);
  return apiClient.get('/api/products', {
    params: { query, limit, from }
  });
}

// NOTE: Offers are server-side rendered (Next.js RSC).
// There is no standalone /api/offers endpoint.
// Offers are embedded in the product page HTML/RSC response.
async function getOffers(slug, condition = null) {
  console.log(`💲 Fetching offers for device: ${slug}`);
  const params = { slug };
  if (condition) params.condition = condition;
  return apiClient.get('/api/offers', { params });
}

// FIXED: payload is { data: { product, vendor, variant } }
// offerId is no longer a separate field
async function createCheckoutSession(checkoutData) {
  console.log(`💳 Creating checkout session`);
  const payload = { data: checkoutData };
  return apiClient.post('/api/checkout-session', payload);
}

// FIXED: session is retrieved by token (not resumeToken)
async function getCheckoutSession(token) {
  console.log(`🔑 Retrieving checkout session`);
  return apiClient.get('/api/checkout-session', { params: { token } });
}

module.exports = {
  apiClient,
  searchProducts,
  getOffers,
  createCheckoutSession,
  getCheckoutSession
};