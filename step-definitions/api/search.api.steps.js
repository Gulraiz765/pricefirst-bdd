const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { searchProducts } = require('../../support/api/apiClient');

let response = null;
let searchQuery = null;
let products = null;

Given('the API base URL is configured', async function() {
  console.log('✅ API base URL configured');
});

When('I search for products with query {string}', async function(query) {
  searchQuery = query;
  response = await searchProducts(query);
  console.log(`Response status: ${response.status}`);
  
  // Fix: API returns { success: true, data: [...] }
  if (response.data && response.data.data && Array.isArray(response.data.data)) {
    products = response.data.data;
    console.log(`✅ Products found in data.data: ${products.length}`);
  } 
  else if (Array.isArray(response.data)) {
    products = response.data;
    console.log(`✅ Products found in data array: ${products.length}`);
  }
  else {
    products = [];
    console.log(`⚠️ No products found. Response structure:`, Object.keys(response.data || {}));
  }
  
  if (products && products.length > 0) {
    console.log(`📱 First product: ${products[0].title} (${products[0].brandName})`);
  }
});

When('I search for products with query {string} and limit {int}', async function(query, limit) {
  searchQuery = query;
  response = await searchProducts(query, limit);
  console.log(`Response status: ${response.status}`);
  
  if (response.data && response.data.data && Array.isArray(response.data.data)) {
    products = response.data.data;
  } else if (Array.isArray(response.data)) {
    products = response.data;
  } else {
    products = [];
  }
  console.log(`Products found: ${products.length} (limit: ${limit})`);
});

Then('the response status should be {int}', function(expectedStatus) {
  expect(response.status).toBe(expectedStatus);
});

Then('the response should contain products', function() {
  expect(products, 'Products array should exist').toBeDefined();
  expect(Array.isArray(products), 'Products should be an array').toBe(true);
  expect(products.length, 'Products array should not be empty').toBeGreaterThan(0);
  console.log(`✅ Found ${products.length} products`);
});

Then('each product should have {string}, {string}, and {string} fields', function(field1, field2, field3) {
  expect(products.length, 'No products to validate').toBeGreaterThan(0);
  
  // Map expected field names to actual API field names
  const actualField1 = field1 === 'name' ? 'title' : field1;
  const actualField2 = field2 === 'slug' ? 'slug' : field2;
  const actualField3 = field3 === 'brand' ? 'brandName' : field3;
  
  products.forEach((product, index) => {
    expect(product, `Product ${index} missing ${actualField1}`).toHaveProperty(actualField1);
    expect(product, `Product ${index} missing ${actualField2}`).toHaveProperty(actualField2);
    expect(product, `Product ${index} missing ${actualField3}`).toHaveProperty(actualField3);
  });
  console.log(`✅ ${products.length} products validated: ${actualField1}, ${actualField2}, ${actualField3}`);
});

Then('the number of products should be less than or equal to {int}', function(limit) {
  expect(products.length).toBeLessThanOrEqual(limit);
});

