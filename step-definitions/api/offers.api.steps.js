// step-definitions/api/offers.api.steps.js
const { When, Then }  = require('@cucumber/cucumber');
const { expect }      = require('@playwright/test');
const { getOffers }   = require('../../support/api/apiClient');
const { validate, validateArray } = require('../../support/api/schemaValidator');

// ─── When steps ──────────────────────────────────────────────────────────────

When('I send a GET request to {string} for device {string}', async function (endpoint, slug) {
  this.lastResponse = await getOffers(slug);
  this.lastSlug     = slug;
});

When('I send a GET request to {string} for device {string} with condition {string}', async function (endpoint, slug, condition) {
  this.lastResponse  = await getOffers(slug, condition);
  this.lastSlug      = slug;
  this.lastCondition = condition;
});

// ─── Then steps ──────────────────────────────────────────────────────────────

Then('the response should contain at least {int} offer', function (minCount) {
  const body   = this.lastResponse.data;
  const offers = body.offers || body.data || body;
  expect(Array.isArray(offers), 'Expected offers to be an array').toBe(true);
  expect(offers.length, `Expected at least ${minCount} offer(s)`).toBeGreaterThanOrEqual(minCount);
  console.log(`   ✅ Got ${offers.length} offer(s)`);
});

Then('each offer should have {string}, {string}, and {string} fields', function (f1, f2, f3) {
  const body   = this.lastResponse.data;
  const offers = body.offers || body.data || body;
  [f1, f2, f3].forEach(field => {
    offers.forEach((offer, i) => {
      expect(offer, `Offer[${i}] missing field "${field}"`).toHaveProperty(field);
    });
  });
  console.log(`   ✅ All offers have fields: ${f1}, ${f2}, ${f3}`);
});

Then('all prices should be greater than 0', function () {
  const body   = this.lastResponse.data;
  const offers = body.offers || body.data || body;
  offers.forEach((offer, i) => {
    expect(offer.price, `Offer[${i}] price should be > 0`).toBeGreaterThan(0);
  });
  console.log('   ✅ All prices > 0');
});

Then('the top offer price should reflect {string} tier', function (condition) {
  const body   = this.lastResponse.data;
  const offers = body.offers || body.data || body;
  expect(offers.length, 'No offers returned').toBeGreaterThan(0);
  // Store by condition so callers can compare tiers
  if (!this.conditionPrices) this.conditionPrices = {};
  this.conditionPrices[condition] = offers[0].price;
  console.log(`   ✅ Top price for "${condition}": ${offers[0].price}`);
});

Then('the offers should be sorted by price in descending order', function () {
  const body   = this.lastResponse.data;
  const offers = body.offers || body.data || body;
  for (let i = 0; i < offers.length - 1; i++) {
    expect(offers[i].price, `Offers not sorted: [${i}]=${offers[i].price} < [${i+1}]=${offers[i+1].price}`)
      .toBeGreaterThanOrEqual(offers[i + 1].price);
  }
  console.log('   ✅ Offers are in descending price order');
});

Then('the response body should match the offers schema', function () {
  const body   = this.lastResponse.data;
  const offers = body.offers || body.data || (Array.isArray(body) ? body : [body]);
  const result = validateArray('offer', offers);
  expect(result.valid, `Schema validation failed: ${result.errors.join('; ')}`).toBe(true);
  console.log('   ✅ All offers match schema');
});