const { BeforeAll, AfterAll, Before, After, setWorldConstructor, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

setDefaultTimeout(30 * 1000);

class CustomWorld {
  constructor() {
    this.page = null;
    this.context = null;
    this.browser = null;
    this.lastResponse = null;
    this.lastSlug = null;
    this.lastCondition = null;
    this.conditionPrices = null;
    this.isApiTest = false;
  }
}

setWorldConstructor(CustomWorld);

let sharedBrowser = null;

BeforeAll({ timeout: 60 * 1000 }, async function () {});

AfterAll(async function () {
  if (sharedBrowser) {
    await sharedBrowser.close();
  }
});

Before(async function (scenario) {
  const tags = scenario.pickle.tags || [];
  const isApiTest = tags.some(tag => tag.name === '@api');
  
  this.isApiTest = isApiTest;
  
  if (!isApiTest) {
    if (!sharedBrowser) {
      sharedBrowser = await chromium.launch({
        headless: process.env.HEADLESS !== 'false'
      });
    }
    this.context = await sharedBrowser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    this.page = await this.context.newPage();
  }
  
  console.log(`\n▶ Running: ${scenario.pickle.name}`);
});

After(async function (scenario) {
  if (!this.isApiTest && this.page) {
    if (scenario.result?.status === 'FAILED') {
      const name = scenario.pickle.name.replace(/\s+/g, '-');
      await this.page.screenshot({ path: `reports/failed-${name}.png` });
      console.log(`📸 Screenshot saved for failed test: ${name}`);
    }
    await this.page.close();
    await this.context.close();
  }
});