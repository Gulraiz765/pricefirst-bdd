const { BeforeAll, AfterAll, Before, After, setWorldConstructor, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

// Global timeout — sab steps ke liye 30 seconds
setDefaultTimeout(30 * 1000);

class CustomWorld {
  constructor() {
    this.page = null;
    this.context = null;
    this.previousPrice = null;
    this.homePage = null;
    this.offersPage = null;
  }
}

setWorldConstructor(CustomWorld);

let browser;

BeforeAll({ timeout: 60 * 1000 }, async function () {
  browser = await chromium.launch({
    headless: process.env.HEADLESS !== 'false'
  });
});

AfterAll(async function () {
  await browser.close();
});

Before(async function (scenario) {
  this.context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  this.page = await this.context.newPage();
  console.log(`\n▶ Running: ${scenario.pickle.name}`);
});

After(async function (scenario) {
  if (scenario.result.status === 'FAILED') {
    const name = scenario.pickle.name.replace(/\s+/g, '-');
    await this.page.screenshot({ path: `reports/failed-${name}.png` });
    console.log(`📸 Screenshot saved for failed test: ${name}`);
  }
  await this.page.close();
  await this.context.close();
});