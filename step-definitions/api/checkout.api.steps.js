const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { createCheckoutSession, getCheckoutSession } = require('../../support/api/apiClient');

let response = null;
let createdSessionToken = null;

// Test data
const validOfferId = '60d0fe4f5311236168a109cc';
const validCheckoutData = {
  fname: 'John',
  lname: 'Doe',
  address: '123 Main St',
  city: 'London',
  postcode: 'SW1A 1AA',
  email: 'john.doe@example.com',
  phone: '07712345678'
};

Given('the API base URL is configured', async function() {
  console.log('✅ API base URL configured');
});

// Checkout session steps
When('I POST to {string} with valid checkout data', async function(endpoint) {
  response = await createCheckoutSession(validOfferId, validCheckoutData);
  console.log(`Response status: ${response.status}`);
  
  // Save token if present in response
  if (response.data && response.data.resumeToken) {
    createdSessionToken = response.data.resumeToken;
  }
});

When('I POST to {string} with missing {string}', async function(endpoint, missingField) {
  const incompleteData = { ...validCheckoutData };
  delete incompleteData[missingField];
  
  response = await createCheckoutSession(validOfferId, incompleteData);
  console.log(`Response status: ${response.status}`);
});

When('I POST to {string} with invalid email {string}', async function(endpoint, email) {
  const invalidEmailData = { ...validCheckoutData, email: email };
  response = await createCheckoutSession(validOfferId, invalidEmailData);
  console.log(`Response status: ${response.status}`);
});

When('I POST to {string} with an empty body', async function(endpoint) {
  response = await apiClient.post(endpoint, {});
  console.log(`Response status: ${response.status}`);
});

When('I retrieve the checkout session using resume token', async function() {
  if (!createdSessionToken) {
    throw new Error('No resume token available. Create a session first.');
  }
  response = await getCheckoutSession(createdSessionToken);
  console.log(`Response status: ${response.status}`);
});

// Then steps
Then('the response status should be {int}', function(expectedStatus) {
  expect(response.status).toBe(expectedStatus);
});

Then('the response should contain an {string}', function(field) {
  expect(response.data).toHaveProperty(field);
});

Then('the response should contain a {string}', function(field) {
  expect(response.data).toHaveProperty(field);
});

Then('the response should have resumeToken and recoveryToken', function() {
  expect(response.data).toHaveProperty('resumeToken');
  expect(response.data).toHaveProperty('recoveryToken');
});

Then('the response error should mention {string}', function(field) {
  const errorStr = JSON.stringify(response.data).toLowerCase();
  expect(errorStr).toContain(field.toLowerCase());
});

Then('the response body should match the checkout success schema', function() {
  expect(response.data).toHaveProperty('resumeToken');
  expect(response.data).toHaveProperty('recoveryToken');
  expect(response.data.message || response.data.status).toBeDefined();
});

Then('the response body should contain an error message', function() {
  expect(response.data.message || response.data.error).toBeDefined();
});