const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { searchProducts } = require('../../support/api/apiClient');

let response = null;
let searchQuery = null;

Given('the API base URL is configured', async function() {
  console.log('✅ API base URL configured');
});

When('I search for products with query {string}', async function(query) {
  searchQuery = query;
  response = await searchProducts(query);
  console.log(`Response status: ${response.status}`);
  console.log(`Products found: ${response.data?.length || 0}`);
});

When('I search for products with query {string} and limit {int}', async function(query, limit) {
  searchQuery = query;
  response = await searchProducts(query, limit);
  console.log(`Response status: ${response.status}`);
  console.log(`Products found: ${response.data?.length || 0} (limit: ${limit})`);
});

Then('the response status should be {int}', function(expectedStatus) {
  expect(response.status).toBe(expectedStatus);
});

Then('the response should contain products', function() {
  expect(response.data).toBeDefined();
  expect(Array.isArray(response.data)).toBe(true);
});

Then('each product should have {string}, {string}, and {string} fields', function(field1, field2, field3) {
  const products = response.data;
  expect(Array.isArray(products)).toBe(true);
  
  if (products.length > 0) {
    products.forEach(product => {
      expect(product).toHaveProperty(field1);
      expect(product).toHaveProperty(field2);
      expect(product).toHaveProperty(field3);
    });
  }
});

Then('the number of products should be less than or equal to {int}', function(limit) {
  const products = response.data;
  expect(products.length).toBeLessThanOrEqual(limit);
});