// step-definitions/api/search.api.steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect }            = require('@playwright/test');
const { searchDevices, searchNoParams } = require('../../support/api/apiClient');

// ─── Background ──────────────────────────────────────────────────────────────

Given('the API base URL is configured', function () {
  this.apiBaseUrl = process.env.BASE_URL || 'https://staging.pricefirst.com';
  console.log(`🔧 API base URL: ${this.apiBaseUrl}`);
});

// ─── When steps ──────────────────────────────────────────────────────────────

When('I send a GET request to {string} with query {string}', async function (endpoint, keyword) {
  this.lastResponse = await searchDevices(keyword);
  this.lastEndpoint = endpoint;
  this.lastKeyword  = keyword;
});

When('I send a GET request to {string} with no query params', async function (endpoint) {
  this.lastResponse = await searchNoParams();
  this.lastEndpoint = endpoint;
});

// ─── Then steps ──────────────────────────────────────────────────────────────

Then('the response status should be {int}', function (expectedStatus) {
  const actual = this.lastResponse.status;
  console.log(`   Status: ${actual} (expected ${expectedStatus})`);
  expect(actual, `Expected status ${expectedStatus} but got ${actual}`).toBe(expectedStatus);
});

Then('the response should contain devices matching {string}', function (keyword) {
  const body    = this.lastResponse.data;
  const results = body.results || body.data || body;

  expect(Array.isArray(results), 'Response results should be an array').toBe(true);
  expect(results.length, `No results returned for "${keyword}"`).toBeGreaterThan(0);

  const keywordLower = keyword.toLowerCase();
  const hasMatch = results.some(item =>
    (item.title || '').toLowerCase().includes(keywordLower) ||
    (item.slug  || '').toLowerCase().includes(keywordLower)
  );
  expect(hasMatch, `No result matching "${keyword}" found in response`).toBe(true);
  console.log(`   ✅ Found ${results.length} results for "${keyword}"`);
});

Then('each result should have {string}, {string}, and {string} fields', function (f1, f2, f3) {
  const body    = this.lastResponse.data;
  const results = body.results || body.data || body;
  [f1, f2, f3].forEach(field => {
    results.forEach((item, i) => {
      expect(item, `Result[${i}] missing field "${field}"`).toHaveProperty(field);
    });
  });
  console.log(`   ✅ All results have fields: ${f1}, ${f2}, ${f3}`);
});

Then('the response results array should be empty', function () {
  const body    = this.lastResponse.data;
  const results = body.results || body.data || body;
  expect(Array.isArray(results), 'Expected an array').toBe(true);
  expect(results.length, 'Expected empty results array').toBe(0);
  console.log('   ✅ Empty results array confirmed');
});

Then('the response body should contain an error message', function () {
  const body = this.lastResponse.data;
  const hasError = body.error || body.message || body.errors;
  expect(hasError, 'Expected an error field in response body').toBeTruthy();
  console.log(`   ✅ Error message present: ${JSON.stringify(hasError)}`);
});