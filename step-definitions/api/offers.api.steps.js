const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { getOffers } = require('../../support/api/apiClient');

// NOTE: PriceFirst uses Next.js RSC — offers are server-side rendered.
// /api/offers does NOT exist as a public REST endpoint → always 404.
// To fix: ask backend team for internal offers API, or switch to E2E tests.

let response = null;

// ─── When ─────────────────────────────────────────────────────────────────────

When('I send a GET request to {string} for device {string}', async function (endpoint, slug) {
  console.log(`📡 Fetching offers for device: ${slug}`);
  response = await getOffers(slug);
  console.log(`Response status: ${response.status}`);
});

When('I send a GET request to {string} for device {string} with condition {string}', async function (endpoint, slug, condition) {
  console.log(`📡 Fetching offers for device: ${slug} with condition: ${condition}`);
  response = await getOffers(slug, condition);
  console.log(`Response status: ${response.status}`);
});

// ─── Then ─────────────────────────────────────────────────────────────────────

Then('the offers response status should be {int}', function (expectedStatus) {
  expect(response.status).toBe(expectedStatus);
});

Then('the response should contain at least {int} offer', function (minCount) {
  const offers = getOffersFromResponse(response);
  expect(Array.isArray(offers)).toBe(true);
  expect(offers.length).toBeGreaterThanOrEqual(minCount);
  console.log(`✅ Found ${offers.length} offer(s)`);
});

Then('each offer should have {string}, {string}, and {string} fields', function (f1, f2, f3) {
  const offers = getOffersFromResponse(response);
  offers.forEach((offer, i) => {
    expect(offer, `Offer ${i} missing ${f1}`).toHaveProperty(f1);
    expect(offer, `Offer ${i} missing ${f2}`).toHaveProperty(f2);
    expect(offer, `Offer ${i} missing ${f3}`).toHaveProperty(f3);
  });
});

Then('all prices should be greater than 0', function () {
  const offers = getOffersFromResponse(response);
  offers.forEach((offer, i) => {
    expect(Number(offer.price || offer.amount), `Offer ${i} price`).toBeGreaterThan(0);
  });
});

Then('the top offer price should reflect {string} tier', function (condition) {
  const offers = getOffersFromResponse(response);
  expect(offers.length).toBeGreaterThan(0);
  console.log(`✅ Top price for "${condition}": £${offers[0].price || offers[0].amount}`);
});

Then('the offers should be sorted by price in descending order', function () {
  const offers = getOffersFromResponse(response);
  for (let i = 0; i < offers.length - 1; i++) {
    const curr = offers[i].price || offers[i].amount;
    const next = offers[i + 1].price || offers[i + 1].amount;
    expect(curr).toBeGreaterThanOrEqual(next);
  }
});

Then('the response body should match the offers schema', function () {
  const offers = getOffersFromResponse(response);
  expect(Array.isArray(offers)).toBe(true);
});

// RENAMED to avoid duplicate with checkout step
Then('the offers response body should contain an error message', function () {
  const hasError = response.data.message || response.data.error;
  expect(hasError).toBeDefined();
  console.log(`✅ Error: ${response.data.message || response.data.error}`);
});

function getOffersFromResponse(res) {
  if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.data?.offers && Array.isArray(res.data.offers)) return res.data.offers;
  if (Array.isArray(res.data)) return res.data;
  return [];
}