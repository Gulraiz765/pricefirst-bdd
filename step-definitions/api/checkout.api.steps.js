// step-definitions/api/checkout.api.steps.js
const { When, Then }     = require('@cucumber/cucumber');
const { expect }         = require('@playwright/test');
const { submitCheckout } = require('../../support/api/apiClient');
const { validate }       = require('../../support/api/schemaValidator');
const fixtures           = require('../../fixtures/api/api.fixtures.json');

// ─── helpers ─────────────────────────────────────────────────────────────────

function validPayload() {
  return { ...fixtures.checkout.validPayload };
}

// ─── When steps ──────────────────────────────────────────────────────────────

When('I POST to {string} with valid checkout data', async function (endpoint) {
  this.lastResponse = await submitCheckout(validPayload());
});

When('I POST to {string} with missing {string}', async function (endpoint, field) {
  const payload = validPayload();
  delete payload[field];
  this.lastMissingField = field;
  this.lastResponse     = await submitCheckout(payload);
});

When('I POST to {string} with email {string}', async function (endpoint, email) {
  const payload = validPayload();
  payload.email = email;
  this.lastResponse = await submitCheckout(payload);
});

When('I POST to {string} with sort code {string} and account number {string}', async function (endpoint, sortCode, accountNumber) {
  const payload = validPayload();
  payload.paymentMethod = 'bank';
  payload.sortCode      = sortCode;
  payload.accountNumber = accountNumber;
  this.lastResponse = await submitCheckout(payload);
});

When('I POST to {string} with an empty body', async function (endpoint) {
  this.lastResponse = await submitCheckout({});
});

// ─── Then steps ──────────────────────────────────────────────────────────────

Then('the response should contain an {string}', function (field) {
  const body = this.lastResponse.data;
  expect(body, `Expected "${field}" in response body`).toHaveProperty(field);
  expect(body[field], `"${field}" should not be empty`).toBeTruthy();
  console.log(`   ✅ Response has "${field}": ${body[field]}`);
});

Then('the response should contain a {string}', function (field) {
  const body = this.lastResponse.data;
  expect(body, `Expected "${field}" in response body`).toHaveProperty(field);
  expect(body[field], `"${field}" should not be empty`).toBeTruthy();
  console.log(`   ✅ Response has "${field}": ${body[field]}`);
});

Then('the response error should mention {string}', function (field) {
  const body = this.lastResponse.data;
  const errorText = JSON.stringify(body.errors || body.error || body.message || body);
  expect(errorText.toLowerCase(), `Expected error to mention "${field}"`).toContain(field.toLowerCase());
  console.log(`   ✅ Error mentions "${field}": ${errorText}`);
});

Then('the response body should match the checkout success schema', function () {
  const body   = this.lastResponse.data;
  const result = validate('checkoutSuccess', body);
  expect(result.valid, `Schema validation failed: ${result.errors.join('; ')}`).toBe(true);
  console.log('   ✅ Response matches checkout success schema');
});