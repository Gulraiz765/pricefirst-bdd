const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { 
  getCategories, 
  getCategoriesWithBrandsAndProducts,
  getProductsByCategory 
} = require('../../support/api/apiClient');

let response = null;

Given('the API base URL is configured', async function() {
  console.log('✅ API base URL configured');
});

When('I send a GET request to {string}', async function(endpoint) {
  if (endpoint === '/api/categories') {
    response = await getCategories();
  } else if (endpoint === '/api/categories/brands/products') {
    response = await getCategoriesWithBrandsAndProducts();
  } else {
    const { apiClient } = require('../../support/api/apiClient');
    response = await apiClient.get(endpoint);
  }
  console.log(`Response status: ${response.status}`);
});

When('I get products for category {string}', async function(categorySlug) {
  response = await getProductsByCategory(categorySlug);
  console.log(`Response status: ${response.status}`);
});

Then('the response status should be {int}', function(expectedStatus) {
  expect(response.status).toBe(expectedStatus);
});

Then('the response should contain categories', function() {
  expect(response.data).toBeDefined();
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);
});

Then('the response should contain categories with brands', function() {
  expect(response.data).toBeDefined();
  expect(Array.isArray(response.data)).toBe(true);
  
  if (response.data.length > 0) {
    expect(response.data[0]).toHaveProperty('brands');
  }
});

Then('the response should contain products', function() {
  expect(response.data).toBeDefined();
  expect(Array.isArray(response.data)).toBe(true);
});