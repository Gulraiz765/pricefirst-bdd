const { When, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");
const { apiClient } = require("../../support/api/apiClient");

let response = null;

// ─── When ─────────────────────────────────────────────────────────────────────

When('I send a GET request to {string}', async function (endpoint) {
  console.log(`📡 GET ${endpoint}`);
  response = await apiClient.get(endpoint);
  console.log(`Response status: ${response.status}`);
});

// FIXED: products by category uses /api/products?category={slug}
When('I get products for category {string}', async function (categorySlug) {
  console.log(`📡 GET products for category: ${categorySlug}`);
  response = await apiClient.get('/api/products', { params: { category: categorySlug } });
  console.log(`Response status: ${response.status}`);
});

// ─── Then ─────────────────────────────────────────────────────────────────────

Then('the categories response status should be {int}', function (expectedStatus) {
  expect(response.status).toBe(expectedStatus);
});

Then('the response should contain categories list', function () {
  const data = response.data?.data || response.data;
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBeGreaterThan(0);
  console.log(`✅ Categories found: ${data.length}`);
});

Then('the response should contain categories with brands list', function () {
  const data = response.data?.data || response.data;
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBeGreaterThan(0);
  console.log(`✅ Categories with brands found: ${data.length}`);
});

Then('the response should contain products list', function () {
  const data = response.data?.data || response.data;
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBeGreaterThan(0);
  console.log(`✅ Products found: ${data.length}`);
});
