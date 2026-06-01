// support/api/apiClient.js
// Centralised HTTP client for all API tests.

const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'https://staging.pricefirst.com';
const TIMEOUT = parseInt(process.env.API_TIMEOUT || '10000', 10);

// ─── create a shared axios instance ──────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// ─── request interceptor: log every outgoing call ────────────────────────────
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

// ─── response interceptor: log status ────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API RESPONSE ← ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.log(`⚠️  API ERROR   ← ${error.response.status} ${error.config?.url}`);
      if (error.response.data) {
        console.log(`   Error details:`, JSON.stringify(error.response.data).substring(0, 200));
      }
      return error.response;
    }
    console.error('❌ Network error:', error.message);
    throw error;
  }
);

// ─── Search & Categories APIs ────────────────────────────────────────────────

async function searchProducts(query, limit = 50, from = 0) {
  console.log(`🔍 Searching products with query: "${query}"`);
  return apiClient.get('/api/products', { 
    params: { query, limit, from }
  });
}

async function getCategories() {
  console.log(`📂 Fetching all categories`);
  return apiClient.get('/api/categories');
}

async function getCategoriesWithBrandsAndProducts() {
  console.log(`📦 Fetching categories with brands and products`);
  return apiClient.get('/api/categories/brands/products');
}

async function getProductsByCategory(categorySlug, limit = 50, from = 0) {
  console.log(`📱 Fetching products for category: ${categorySlug}`);
  return apiClient.get(`/api/products/category/${categorySlug}`, {
    params: { limit, from }
  });
}

async function getProductsByBrand(brandSlug, limit = 50, from = 0) {
  console.log(`🏷️  Fetching products for brand: ${brandSlug}`);
  return apiClient.get(`/api/products/brand/${brandSlug}`, {
    params: { limit, from }
  });
}

async function getBlogs() {
  console.log(`📝 Fetching all blogs`);
  return apiClient.get('/api/blogs');
}

async function getBlogCategories() {
  console.log(`📚 Fetching blog categories`);
  return apiClient.get('/api/blog-categories');
}

// ─── Checkout Session API ───────────────────────────────────────────────────

/**
 * POST /api/checkout-session - Save or update guest checkout session
 * @param {string} offerId - Offer ID (e.g., "60d0fe4f5311236168a109cc")
 * @param {object} checkoutData - Checkout data object
 */
async function createCheckoutSession(offerId, checkoutData) {
  console.log(`💳 Creating checkout session with offerId: ${offerId}`);
  const payload = {
    offerId: offerId,
    data: checkoutData
  };
  return apiClient.post('/api/checkout-session', payload);
}

/**
 * GET /api/checkout-session - Retrieve checkout session
 * @param {string} resumeToken - Resume token from previous session
 */
async function getCheckoutSession(resumeToken) {
  console.log(`🔑 Retrieving checkout session with token`);
  return apiClient.get('/api/checkout-session', {
    params: { resumeToken }
  });
}

// Export all functions
module.exports = {
  apiClient,
  searchProducts,
  getCategories,
  getCategoriesWithBrandsAndProducts,
  getProductsByCategory,
  getProductsByBrand,
  getBlogs,
  getBlogCategories,
  createCheckoutSession,
  getCheckoutSession
};