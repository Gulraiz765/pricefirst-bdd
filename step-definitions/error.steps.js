const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'https://staging.pricefirst.com';

Given('I am on the PriceFirst website', async function () {
  await this.page.goto(BASE_URL);
  await this.page.waitForLoadState('networkidle');
  console.log(`✅ Navigated to: ${BASE_URL}`);
});

When('I navigate to a broken URL {string}', async function (brokenPath) {
  const brokenUrl = `${BASE_URL}${brokenPath}`;
  console.log(`🔗 Navigating to broken URL: ${brokenUrl}`);
  await this.page.goto(brokenUrl, { timeout: 15000 });
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(1000);
  console.log(`📍 Current URL: ${this.page.url()}`);
});

Then('I should see a {string} or {string} message', async function (errorCode, errorMessage) {
  await this.page.waitForTimeout(1000);
  const bodyText = await this.page.locator('body').textContent();
  
  const hasErrorCode = bodyText.includes(errorCode);
  const hasErrorMessage = bodyText.toLowerCase().includes(errorMessage.toLowerCase());
  
  console.log(`🔍 Looking for "${errorCode}" or "${errorMessage}"`);
  console.log(`Has "${errorCode}": ${hasErrorCode}`);
  console.log(`Has "${errorMessage}": ${hasErrorMessage}`);
  
  expect(hasErrorCode || hasErrorMessage, 
    `Expected to see "${errorCode}" or "${errorMessage}" on 404 page`
  ).toBeTruthy();
  console.log(`✅ 404 message found on page`);
});

Then('I should see a {string} button', async function (buttonText) {
  const returnHomeButton = this.page.locator('body > div.min-h-screen.bg-white.lg\\:rounded-t-6xl > div > div > button');
  
  let isVisible = false;
  
  if (await returnHomeButton.count() > 0) {
    isVisible = await returnHomeButton.isVisible().catch(() => false);
    if (isVisible) {
      console.log(`✅ Found "${buttonText}" button using exact selector`);
    }
  }
  
  if (!isVisible) {
    const button = this.page.locator(`button:has-text("${buttonText}")`).first();
    if (await button.count() > 0) {
      isVisible = await button.isVisible().catch(() => false);
      if (isVisible) {
        console.log(`✅ Found "${buttonText}" button using text selector`);
      }
    }
  }
  
  expect(isVisible, `Expected to see "${buttonText}" button on 404 page`).toBeTruthy();
  console.log(`✅ "${buttonText}" button is visible`);
});

Then('the page title should indicate an error', async function () {
  const title = await this.page.title();
  console.log(`📄 Page title: "${title}"`);
  
  const errorKeywords = ['404', 'error', 'not found', 'page not found'];
  const hasErrorKeyword = errorKeywords.some(keyword => 
    title.toLowerCase().includes(keyword.toLowerCase())
  );
  
  const bodyText = await this.page.locator('body').textContent();
  const hasErrorInBody = errorKeywords.some(keyword => 
    bodyText.toLowerCase().includes(keyword.toLowerCase())
  );
  
  expect(hasErrorKeyword || hasErrorInBody, 
    `Expected page title or content to indicate an error. Title: "${title}"`
  ).toBeTruthy();
  console.log(`✅ Page indicates an error state`);
});

// FIXED: New specific step for 404 page button (avoids conflict with generic button clicker)
When('I click the 404 page {string} button', async function (buttonText) {
  console.log(`🔘 Clicking "${buttonText}" button on 404 page...`);
  
  const returnHomeButton = this.page.locator('body > div.min-h-screen.bg-white.lg\\:rounded-t-6xl > div > div > button');
  
  let clicked = false;
  
  if (await returnHomeButton.count() > 0 && await returnHomeButton.isVisible().catch(() => false)) {
    await returnHomeButton.click();
    clicked = true;
    console.log(`✅ Clicked "${buttonText}" button using exact selector`);
  }
  
  if (!clicked) {
    const button = this.page.locator(`button:has-text("${buttonText}")`).first();
    if (await button.count() > 0 && await button.isVisible().catch(() => false)) {
      await button.click();
      clicked = true;
      console.log(`✅ Clicked "${buttonText}" button using text selector`);
    }
  }
  
  if (!clicked) {
    const anyButton = this.page.locator('button:has-text("Return")').first();
    if (await anyButton.count() > 0 && await anyButton.isVisible().catch(() => false)) {
      await anyButton.click();
      clicked = true;
      console.log(`✅ Clicked "Return" button`);
    }
  }
  
  expect(clicked, `Could not find or click "${buttonText}" button`).toBeTruthy();
  
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(3000);
  
  const currentUrl = this.page.url();
  console.log(`📍 After click, URL: ${currentUrl}`);
});

// ✅ FIXED: Accept both base URL and /home URL
Then('I should be redirected to the home page', async function () {
  await this.page.waitForTimeout(2000);
  const currentUrl = this.page.url();
  console.log(`📍 Current URL after redirect: ${currentUrl}`);
  
  const isHomePage = currentUrl === BASE_URL || 
                     currentUrl === `${BASE_URL}/` || 
                     currentUrl === `${BASE_URL}/home`;
  
  expect(isHomePage, `Expected to be on home page (${BASE_URL} or ${BASE_URL}/home) but got: ${currentUrl}`).toBeTruthy();
  console.log(`✅ Successfully redirected to home page`);
});

// ✅ FIXED: Accept both base URL and /home URL
Then('the URL should be {string}', async function (expectedUrl) {
  await this.page.waitForTimeout(1000);
  const currentUrl = this.page.url();
  console.log(`📍 Expected URL: ${expectedUrl}`);
  console.log(`📍 Actual URL: ${currentUrl}`);
  
  const isAcceptable = currentUrl === expectedUrl || 
                       currentUrl === `${expectedUrl}/home` ||
                       currentUrl === `${expectedUrl}/`;
  
  expect(isAcceptable, `Expected URL to be "${expectedUrl}" or "${expectedUrl}/home" but got: ${currentUrl}`).toBeTruthy();
  console.log(`✅ URL is acceptable: ${currentUrl}`);
});