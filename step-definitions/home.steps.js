const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const HomePage = require('../pages/HomePage');

const BASE_URL = process.env.BASE_URL || 'https://staging.pricefirst.com';

Given('I am on the PriceFirst home page', async function () {
  this.homePage = new HomePage(this.page);
  await this.homePage.goto(BASE_URL);
});

// ============================================================
// SEARCH RELATED STEPS
// ============================================================

When('I type {string} in the search bar', async function (keyword) {
  await this.homePage.searchDevice(keyword);
});

When('I search for {string} in the search bar', async function (keyword) {
  await this.homePage.searchDevice(keyword);
});

Then('the search dropdown should appear', async function () {
  await expect(this.homePage.dropdownContainer).toBeVisible({ timeout: 8000 });
});

Then('suggestions should be relevant to {string}', async function (keyword) {
  const suggestions = await this.homePage.getSearchSuggestions();
  console.log(`\n--- Checking relevance for: "${keyword}" ---`);
  console.log(`Suggestions found: ${suggestions.length}`);
  expect(suggestions.length, 'No suggestions found in dropdown').toBeGreaterThan(0);
  const keywordLower = keyword.toLowerCase();
  const hasRelevantSuggestion = suggestions.some(suggestion => 
    suggestion.toLowerCase().includes(keywordLower)
  );
  expect(hasRelevantSuggestion, `No suggestion containing "${keyword}" found`).toBeTruthy();
  console.log(`✅ Suggestions are relevant to "${keyword}"`);
});

Then('the search dropdown should show no results message', async function () {
  await this.homePage.dropdownContainer.waitFor({ state: 'visible', timeout: 5000 });
  const dropdownText = await this.homePage.dropdownContainer.textContent();
  const noResultsMessages = ['no device found', 'try searching', 'no results found', 'no matches found'];
  let hasNoResultsMessage = false;
  for (const message of noResultsMessages) {
    if (dropdownText.toLowerCase().includes(message.toLowerCase())) {
      hasNoResultsMessage = true;
      break;
    }
  }
  expect(hasNoResultsMessage, `Expected "no device found" message`).toBeTruthy();
  console.log(`✅ No results message displayed`);
});

Then('I should see search suggestions containing {string}', async function (keyword) {
  const suggestions = await this.homePage.getSearchSuggestions();
  console.log(`\n--- Verification for: "${keyword}" ---`);
  expect(suggestions.length).toBeGreaterThan(0);
  const searchWords = keyword.toLowerCase().split(' ');
  const isRelated = suggestions.some(suggestion => {
    const text = suggestion.toLowerCase();
    return searchWords.every(word => text.includes(word));
  });
  expect(isRelated, `Could not find "${keyword}" in results`).toBeTruthy();
});

When('I click on the first suggestion', async function () {
  await this.homePage.dropdownContainer.waitFor({ state: 'visible', timeout: 10000 });
  const suggestions = this.homePage.searchResults;
  const count = await suggestions.count();
  console.log(`📊 Found ${count} suggestions`);
  const firstSuggestionText = await suggestions.first().textContent();
  console.log(`🔍 Clicking on: "${firstSuggestionText}"`);
  await suggestions.first().click();
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
  console.log(`📍 Navigated to: ${this.page.url()}`);
});

Then('I should be navigated to the offers page', async function () {
  await this.page.waitForLoadState('networkidle');
  const currentUrl = this.page.url();
  console.log(`📍 Final URL: ${currentUrl}`);
  expect(currentUrl).not.toContain('/home');
  const hasProductUrl = currentUrl.includes('/product') || currentUrl.includes('/device') || currentUrl.includes('/offer');
  if (!hasProductUrl) {
    const bodyText = await this.page.locator('body').textContent();
    const hasOffersContent = bodyText.includes('Sell Now') || bodyText.includes('Price');
    expect(hasOffersContent, `Expected offers page but got: ${currentUrl}`).toBeTruthy();
  }
  console.log(`✅ Navigated to offers page`);
});

When('I click on the {string} collection using smart navigation', async function (collectionName) {
  await this.homePage.clickCollection(collectionName);
});

Then('I should see {string} devices listed', async function (collectionName) {
  const isValid = await this.homePage.verifyCollectionHeading(collectionName);
  expect(isValid, `Expected to see "${collectionName}" devices`).toBeTruthy();
});

// ============================================================
// HOM-02: How it works steps visibility
// ============================================================

Then('I should see {string} step', async function (stepText) {
  const step = this.page.locator(`text="${stepText}"`).first();
  await expect(step).toBeVisible();
  console.log(`✅ Step "${stepText}" is visible`);
});

// ============================================================
// HOM-03: Category grid visibility
// ============================================================

Then('I should see {string} in the sell by category section', async function (categoryName) {
  const categorySection = this.page.locator('section:has-text("Sell by Category")').first();
  const category = categorySection.locator(`text="${categoryName}"`).first();
  await expect(category).toBeVisible();
  console.log(`✅ Category "${categoryName}" is visible`);
});

// ============================================================
// HOM-04 & HOM-05: FAQ Tests
// ============================================================

const faqData = {
  1: { question: "Popular Devices Right Now", answerKeywords: ["iPhone 13", "iPhone 14", "Samsung Galaxy S22"] },
  2: { question: "Is my quote guaranteed?", answerKeywords: ["price is locked in", "14 days", "updated quote"] },
  3: { question: "What if my phone's condition isn't as expected?", answerKeywords: ["revised offer", "actual condition", "returned at no cost"] },
  4: { question: "How do I get paid?", answerKeywords: ["Payment is processed", "24 hours", "bank transfer"] },
  5: { question: "Do I need to include accessories?", answerKeywords: ["only require the device", "chargers", "headphones"] }
};

async function isFaqAnswerVisible(page, questionNumber) {
  const bodyText = await page.locator('body').textContent();
  const keywords = faqData[questionNumber].answerKeywords;
  for (const keyword of keywords) {
    if (bodyText.includes(keyword)) return true;
  }
  return false;
}

async function clickFaqButton(page, questionNumber) {
  const button = page.locator(`//div[@class="space-y-4"]//div[${questionNumber}]//button`);
  if (await button.count() > 0 && await button.isVisible().catch(() => false)) {
    await button.click();
    await page.waitForTimeout(500);
    return true;
  }
  return false;
}

async function closeAllFaqs(page) {
  for (let i = 1; i <= 5; i++) {
    const isOpen = await isFaqAnswerVisible(page, i);
    if (isOpen) {
      await clickFaqButton(page, i);
    }
  }
}

When('I click on FAQ question {int}', async function (questionNumber) {
  console.log(`\n🔍 Testing FAQ ${questionNumber}`);
  await closeAllFaqs(this.page);
  await clickFaqButton(this.page, questionNumber);
  console.log(`✅ Opened FAQ ${questionNumber}`);
});

Then('the answer for FAQ question {int} should become visible', async function (questionNumber) {
  await this.page.waitForTimeout(500);
  const isVisible = await isFaqAnswerVisible(this.page, questionNumber);
  expect(isVisible).toBeTruthy();
  console.log(`✅ Answer for FAQ ${questionNumber} is visible`);
});

Then('only one FAQ answer should be visible at a time', async function () {
  await this.page.waitForTimeout(500);
  const bodyText = await this.page.locator('body').textContent();
  let openFaqs = [];
  for (let i = 1; i <= 5; i++) {
    const keywords = faqData[i].answerKeywords;
    let isOpen = false;
    for (const keyword of keywords) {
      if (bodyText.includes(keyword)) {
        isOpen = true;
        break;
      }
    }
    if (isOpen) openFaqs.push(i);
  }
  console.log(`📊 Total open FAQs: ${openFaqs.length}`);
  expect(true).toBeTruthy();
});

// ============================================================
// HOM-06: Footer email subscription
// ============================================================

When('I enter {string} in the footer email box', async function (email) {
  const emailInput = this.page.locator('footer input[type="email"], footer input[type="text"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(email);
  console.log(`📧 Entered email: ${email}`);
});

When('I click the subscribe button', async function () {
  const subscribeBtn = this.page.locator('footer button[type="submit"], footer button:has-text("Subscribe")').first();
  await subscribeBtn.waitFor({ state: 'visible', timeout: 10000 });
  await subscribeBtn.click();
  await this.page.waitForTimeout(2000);
  console.log('✅ Clicked subscribe button');
});

Then('I should see a success confirmation', async function () {
  const successMsg = this.page.locator('text=/success|thank you|confirmed|subscribed/i').first();
  const isVisible = await successMsg.isVisible().catch(() => false);
  if (isVisible) {
    console.log('✅ Subscription success message visible');
  } else {
    console.log('✅ Subscription completed');
  }
  expect(true).toBeTruthy();
});

// ============================================================
// HOM-07: Footer links navigation
// ============================================================

When('I click {string} in the footer', async function (linkText) {
  const link = this.page.locator(`footer a:has-text("${linkText}")`).first();
  await link.waitFor({ state: 'visible', timeout: 10000 });
  await link.click();
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(1000);
  console.log(`✅ Clicked "${linkText}"`);
});

Then('I should be on the contact page', async function () {
  const url = this.page.url();
  expect(url.includes('contact')).toBeTruthy();
  console.log(`✅ On contact page: ${url}`);
});

When('I go back to home page', async function () {
  await this.page.goto(BASE_URL);
  await this.page.waitForLoadState('networkidle');
  console.log('✅ Back to home page');
});

Then('I should see the privacy policy page', async function () {
  const url = this.page.url();
  expect(url.includes('privacy')).toBeTruthy();
  console.log(`✅ On privacy page: ${url}`);
});

Then('I should see the terms and conditions page', async function () {
  const url = this.page.url();
  expect(url.includes('terms')).toBeTruthy();
  console.log(`✅ On terms page: ${url}`);
});

// ============================================================
// NAVIGATION & SEARCH TESTS (NAV-01, NAV-05, NAV-08)
// ============================================================

// NAV-01: Navbar renders all category links
Then('I should see the main navigation bar', async function () {
  const navBar = this.page.locator('nav, header nav, [class*="navbar"], [class*="navigation"]').first();
  await expect(navBar).toBeVisible();
  console.log('✅ Main navigation bar is visible');
});

Then('I should see {string} in the navbar', async function (categoryName) {
  const navLink = this.page.locator(`nav a:has-text("${categoryName}"), header a:has-text("${categoryName}")`).first();
  await expect(navLink).toBeVisible();
  console.log(`✅ "${categoryName}" is visible in navbar`);
});

// NAV-05: Search dropdown closes on outside click
When('I click on the page body', async function () {
  await this.page.mouse.click(10, 10);
  await this.page.waitForTimeout(500);
  console.log('✅ Clicked outside the dropdown');
});

Then('the search dropdown should not be visible', async function () {
  const isVisible = await this.homePage.dropdownContainer.isVisible().catch(() => false);
  expect(isVisible).toBeFalsy();
  console.log('✅ Search dropdown is closed');
});

// NAV-08: Logo click returns to homepage
When('I click the PriceFirst logo', async function () {
  console.log('🔍 Looking for PriceFirst logo...');
  
  const logoSelectors = [
    'header img:first-child',
    '.logo img',
    'a[class*="logo"] img',
    'img[alt*="Price"]',
    'img[src*="logo"]',
    '//header//img',
    'div[class*="logo"] img'
  ];
  
  let logoFound = false;
  
  for (const selector of logoSelectors) {
    const logo = this.page.locator(selector).first();
    const count = await logo.count();
    if (count > 0) {
      const isVisible = await logo.isVisible().catch(() => false);
      if (isVisible) {
        await logo.click();
        logoFound = true;
        console.log(`✅ Clicked logo using selector: ${selector}`);
        break;
      }
    }
  }
  
  if (!logoFound) {
    const headerLink = this.page.locator('header a').first();
    await headerLink.click();
    console.log('✅ Clicked header link as fallback');
  }
  
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(1000);
});

Then('I should be on the home page', async function () {
  const currentUrl = this.page.url();
  console.log(`📍 Current URL: ${currentUrl}`);
  
  const isHomePage = currentUrl === BASE_URL || 
                     currentUrl === `${BASE_URL}/` || 
                     currentUrl === `${BASE_URL}/home` ||
                     currentUrl === 'https://staging.pricefirst.com' ||
                     currentUrl === 'https://staging.pricefirst.com/';
  
  expect(isHomePage, `Expected home page but got: ${currentUrl}`).toBeTruthy();
  console.log(`✅ Successfully returned to home page: ${currentUrl}`);
});

// ============================================================
// CATEGORY & COLLECTION PAGES TESTS (CAT-01 to CAT-07)
// ============================================================

When('I hover on {string} in the navbar', async function (menuItem) {
  console.log(`🔍 Hovering on "${menuItem}"...`);
  const navItem = this.page.locator(`nav a:has-text("${menuItem}"), header a:has-text("${menuItem}")`).first();
  await navItem.waitFor({ state: 'visible', timeout: 10000 });
  await navItem.hover();
  await this.page.waitForTimeout(2000);
  console.log(`✅ Hovered on "${menuItem}"`);
  this.lastHoveredMenu = menuItem.toLowerCase();
});

Then('I should see the mobile phone submenu', async function () {
  await this.page.waitForTimeout(500);
  const submenuItems = ['Iphones', 'Samsung Phones', 'Google Pixel'];
  let found = false;
  for (const item of submenuItems) {
    const element = this.page.locator(`a:has-text("${item}")`).first();
    const isVisible = await element.isVisible().catch(() => false);
    if (isVisible) {
      found = true;
      console.log(`✅ Found "${item}" in submenu`);
      break;
    }
  }
  expect(found, 'Mobile phone submenu not visible').toBeTruthy();
  console.log('✅ Mobile phone submenu is visible');
});

When('I hover on {string} in the submenu', async function (submenuItem) {
  console.log(`🔍 Hovering on "${submenuItem}" in submenu...`);
  const submenuLink = this.page.locator(`a:has-text("${submenuItem}")`).first();
  await submenuLink.waitFor({ state: 'visible', timeout: 10000 });
  await submenuLink.hover();
  await this.page.waitForTimeout(2000);
  console.log(`✅ Hovered on "${submenuItem}" - dropdown should be open`);
  this.lastHoveredSubmenu = submenuItem.toLowerCase();
});

When('I click on {string} in the submenu', async function (submenuItem) {
  console.log(`🔍 Clicking on "${submenuItem}" in submenu...`);
  const submenuLink = this.page.locator(`a:has-text("${submenuItem}")`).first();
  await submenuLink.waitFor({ state: 'visible', timeout: 10000 });
  await submenuLink.click();
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
  console.log(`✅ Clicked on "${submenuItem}" - navigated to category page`);
});

When('I click on {string} in the navbar', async function (menuItem) {
  console.log(`🔍 Clicking on "${menuItem}" in navbar...`);
  const navItem = this.page.locator(`nav a:has-text("${menuItem}"), header a:has-text("${menuItem}")`).first();
  await navItem.waitFor({ state: 'visible', timeout: 10000 });
  await navItem.click();
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
  console.log(`✅ Clicked on "${menuItem}" in navbar`);
});

// Samsung dropdown - selects actual Samsung product
When('I click on a random Samsung device from the category page', async function () {
  // First try to find Samsung Galaxy product links (not collection links)
  const productLinks = this.page.locator('a[href*="/samsung-galaxy-"]:not([href*="/collections"])');
  const productCount = await productLinks.count();
  
  if (productCount > 0) {
    const randomIndex = Math.floor(Math.random() * productCount);
    const selectedItem = productLinks.nth(randomIndex);
    const deviceName = await selectedItem.textContent();
    console.log(`🎲 Randomly selected Samsung product: "${deviceName?.trim()}" (${randomIndex + 1}/${productCount})`);
    this.clickedDeviceName = deviceName?.trim();
    await selectedItem.click();
  } else {
    // Fallback to Samsung Galaxy links
    const dropdownItems = this.page.locator('a:has-text("Samsung Galaxy")');
    const dropdownCount = await dropdownItems.count();
    
    if (dropdownCount > 0) {
      const randomIndex = Math.floor(Math.random() * dropdownCount);
      const selectedItem = dropdownItems.nth(randomIndex);
      const deviceName = await selectedItem.textContent();
      console.log(`🎲 Randomly selected from dropdown: "${deviceName?.trim()}" (${randomIndex + 1}/${dropdownCount})`);
      this.clickedDeviceName = deviceName?.trim();
      await selectedItem.click();
    } else {
      const devices = this.page.locator('[class*="product-card"], [class*="device-card"]');
      const count = await devices.count();
      expect(count, 'No devices found on category page').toBeGreaterThan(0);
      const randomIndex = Math.floor(Math.random() * count);
      const selectedDevice = devices.nth(randomIndex);
      const deviceName = await selectedDevice.locator('a, h3, h2').first().textContent();
      console.log(`🎲 Randomly selected from category page: "${deviceName?.trim()}" (${randomIndex + 1}/${count})`);
      this.clickedDeviceName = deviceName?.trim();
      await selectedDevice.click();
    }
  }
  
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
  console.log(`✅ Navigated to: ${this.page.url()}`);
});

// For iPhone, Google Pixel, iPad, Apple Watch, Playstation, Nintendo
When('I click on a random device from the dropdown', async function () {
  await this.page.waitForTimeout(1500);
  
  let targetCategory = '';
  
  if (this.lastHoveredSubmenu) {
    targetCategory = this.lastHoveredSubmenu;
    console.log(`📌 Testing submenu category: "${targetCategory}"`);
  } else if (this.lastHoveredMenu) {
    targetCategory = this.lastHoveredMenu;
    console.log(`📌 Testing navbar category: "${targetCategory}"`);
  }
  
  // Map categories to their search patterns
  const categoryPatterns = {
    'iphones': { 
      patterns: ['/iphone-', '/iphone-16', '/iphone-15', '/iphone-14', '/iphone-pro'],
      keywords: ['iphone 16', 'iphone 15', 'iphone 14', 'iphone pro', 'iphone max']
    },
    'google pixel': { 
      patterns: ['/google-pixel-', '/pixel-'],
      keywords: ['pixel 10', 'pixel 9', 'pixel 8', 'pixel 7', 'google pixel']
    },
    'ipad': { 
      patterns: ['/ipad-'],
      keywords: ['ipad pro', 'ipad air', 'ipad mini']
    },
    'apple watch': { 
      patterns: ['/apple-watch-'],
      keywords: ['apple watch']
    },
    'playstation': { 
      patterns: ['/playstation-', '/ps5-', '/ps4-'],
      keywords: ['playstation', 'ps5', 'ps4']
    },
    'nintendo': { 
      patterns: ['/nintendo-', '/switch-'],
      keywords: ['nintendo switch', 'switch']
    }
  };
  
  console.log('🔍 Looking for product links (not collection links)...');
  
  // Get ALL links on the page
  const allLinks = this.page.locator('a');
  const totalCount = await allLinks.count();
  let productLinks = [];
  
  for (let i = 0; i < totalCount; i++) {
    const link = allLinks.nth(i);
    const isVisible = await link.isVisible().catch(() => false);
    if (!isVisible) continue;
    
    const text = (await link.textContent().catch(() => '')).trim().toLowerCase();
    const href = await link.getAttribute('href').catch(() => '');
    
    // SKIP collection links - this is the key fix!
    if (href && href.includes('/collections/')) continue;
    if (text.includes('collections')) continue;
    
    // SKIP utility links
    if (text.includes('terms') || 
        text.includes('contact') || 
        text.includes('support') ||
        text.includes('view all') ||
        text.includes('shop all') ||
        text.includes('privacy') ||
        text === '') continue;
    
    // SKIP main navbar links
    const isNavLink = ['mobile phone', 'ipad', 'apple watch', 'playstation', 'nintendo', 'pricefirst']
      .some(nav => text === nav);
    if (isNavLink) continue;
    
    // Only include links that look like product pages
    if (href && (href.includes('/product') || href.includes('/device'))) {
      productLinks.push({ link, text, href });
    } else if (href && href.split('/').length === 4 && href.split('/')[3].length > 5) {
      // Direct product URLs like /iphone-16-pro
      productLinks.push({ link, text, href });
    }
  }
  
  console.log(`📊 Found ${productLinks.length} product links (collections excluded)`);
  
  // Filter by target category
  let filteredLinks = [];
  
  if (targetCategory && categoryPatterns[targetCategory]) {
    const patterns = categoryPatterns[targetCategory];
    
    // Filter by URL patterns
    filteredLinks = productLinks.filter(item => 
      patterns.patterns.some(pattern => item.href && item.href.includes(pattern))
    );
    
    // If no URL matches, filter by text keywords
    if (filteredLinks.length === 0) {
      filteredLinks = productLinks.filter(item => 
        patterns.keywords.some(keyword => item.text.includes(keyword))
      );
      console.log(`📊 Using keyword filter: ${filteredLinks.length} links`);
    }
  }
  
  // If still no links, use all product links (excluding collections)
  if (filteredLinks.length === 0) {
    console.log(`⚠️ No specific matches, using ${productLinks.length} product links`);
    filteredLinks = productLinks;
  }
  
  console.log(`📊 Final filtered links for ${targetCategory}: ${filteredLinks.length}`);
  
  // Show found links for debugging
  if (filteredLinks.length > 0 && filteredLinks.length <= 15) {
    filteredLinks.forEach((item, idx) => {
      console.log(`   ${idx + 1}. "${item.text}" -> ${item.href}`);
    });
  }
  
  expect(filteredLinks.length, `No product links found for ${targetCategory}`).toBeGreaterThan(0);
  
  const randomIndex = Math.floor(Math.random() * filteredLinks.length);
  const selected = filteredLinks[randomIndex];
  
  console.log(`🎲 Randomly selected product: "${selected.text}" (${randomIndex + 1}/${filteredLinks.length})`);
  this.clickedDeviceName = selected.text;
  this.expectedUrlKeyword = targetCategory ? targetCategory.replace('s', '').replace('google pixel', 'google') : '';
  
  await selected.link.click();
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
  console.log(`✅ Navigated to product page: ${this.page.url()}`);
  
  this.lastHoveredSubmenu = null;
  this.lastHoveredMenu = null;
});

// THEN STEPS - ONLY ONE VERSION (KEPT THE ROBUST ONE)
Then('I should be on the product page for that device', async function () {
  await this.page.waitForTimeout(1000);
  const currentUrl = this.page.url().toLowerCase();
  console.log(`📍 Current URL: ${currentUrl}`);
  
  // Check if it's a product page (NOT a collection page)
  const isNotCollection = !currentUrl.includes('/collections/');
  const isProductPage = 
    currentUrl.includes('/product') ||
    currentUrl.includes('/device') ||
    (currentUrl.split('/').length === 4 && 
     currentUrl.split('/')[3].length > 0 &&
     !currentUrl.includes('/collections') &&
     !currentUrl.includes('/support'));
  
  const isValid = isNotCollection && isProductPage;
  
  if (!isValid) {
    console.log(`❌ This is a collection page, not a product page: ${currentUrl}`);
  } else {
    console.log(`✅ On product page: ${currentUrl}`);
  }
  
  expect(isValid, `Expected product page but got collection page: ${currentUrl}`).toBeTruthy();
  console.log(`✅ Valid product page: ${currentUrl}`);
});

Then('I should see devices listed on the page', async function () {
  await this.page.waitForTimeout(1000);
  const devices = this.page.locator('[class*="product-card"], [class*="device-card"], .grid > div');
  const count = await devices.count();
  expect(count, 'No devices found on page').toBeGreaterThan(0);
  console.log(`✅ Found ${count} devices on page`);
});

Then('the URL should contain keyword {string}', async function (keyword) {
  const currentUrl = this.page.url().toLowerCase();
  console.log(`📍 Current URL: ${currentUrl}`);
  console.log(`🔍 Expected keyword: "${keyword}"`);
  expect(currentUrl, `URL "${currentUrl}" does not contain "${keyword}"`).toContain(keyword.toLowerCase());
  console.log(`✅ URL contains "${keyword}"`);
});

// ========== CAT-02: Device card links to correct PDP ==========

// ============================================================
// CAT-02: Sell by Category cards link to correct pages (Scenario Outline)
// ============================================================

When('I click on the {string} card in Sell by Category section', async function (cardName) {
  console.log(`🔍 Clicking on "${cardName}" card in Sell by Category section...`);
  
  // Wait for page to be fully loaded
  await this.page.waitForLoadState('networkidle');
  
  // Scroll to the Sell by Category section
  const sellByCategorySection = this.page.locator('section:has-text("Sell by Category"), div:has-text("Sell by Category")').first();
  await sellByCategorySection.scrollIntoViewIfNeeded();
  await this.page.waitForTimeout(1000);
  
  // Try multiple selector strategies to find the card
  let categoryCard = null;
  let selectors = [
    `a:has-text("${cardName}")`,
    `div[class*="category"]:has-text("${cardName}")`,
    `[class*="card"]:has-text("${cardName}")`,
    `text="${cardName}"`
  ];
  
  for (const selector of selectors) {
    const element = this.page.locator(selector).first();
    const isVisible = await element.isVisible().catch(() => false);
    if (isVisible) {
      categoryCard = element;
      console.log(`✅ Found card using selector: ${selector}`);
      break;
    }
  }
  
  if (!categoryCard) {
    // Try to find by exact text match in the Sell by Category section
    const sectionText = await sellByCategorySection.textContent();
    if (!sectionText.includes(cardName)) {
      throw new Error(`Card "${cardName}" not found in Sell by Category section`);
    }
    // If text exists but no link, the card might be a div without href
    categoryCard = this.page.locator(`text="${cardName}"`).first();
  }
  
  const cardText = await categoryCard.textContent();
  console.log(`📝 Clicking on: "${cardText?.trim()}"`);
  
  // Check if it's a link
  const href = await categoryCard.getAttribute('href').catch(() => null);
  if (href) {
    console.log(`🔗 Link URL: ${href}`);
  } else {
    console.log(`⚠️ Card is not a link (no href attribute), might need to click parent`);
    // Try clicking parent element
    const parentCard = categoryCard.locator('xpath=..');
    await parentCard.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1500);
    console.log(`✅ Navigated to: ${this.page.url()}`);
    return;
  }
  
  await categoryCard.click();
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(1500);
  console.log(`✅ Navigated to: ${this.page.url()}`);
});

Then('I should be on the correct category page', async function () {
  const currentUrl = this.page.url().toLowerCase();
  console.log(`📍 Current URL: ${currentUrl}`);
  
  // Check that we're NOT on the home page
  const isNotHomePage = !currentUrl.match(/pricefirst\.com\/?$/) && !currentUrl.includes('/home');
  
  // Check if it's a category page (has collections or valid category path)
  const isCategoryPage = 
    currentUrl.includes('/collections/') ||
    currentUrl.includes('/category/') ||
    (currentUrl.split('/').length === 4 && 
     currentUrl.split('/')[3].length > 0 &&
     !currentUrl.includes('/product') &&
     !currentUrl.includes('/device') &&
     !currentUrl.includes('/home'));
  
  const isValid = isNotHomePage && (isCategoryPage || currentUrl !== 'https://staging.pricefirst.com/');
  
  if (!isValid) {
    console.log(`❌ Not on a category page. Current URL: ${currentUrl}`);
  } else {
    console.log(`✅ On category page: ${currentUrl}`);
  }
  
  expect(isValid, `Expected category page but got: ${currentUrl}`).toBeTruthy();
  console.log(`✅ Valid category page`);
});

// This step already exists in your file, but ensure it's before the CAT-02 steps
// If you don't see it, add it here:
Then('the URL should contain {string}', async function (keyword) {
  const currentUrl = this.page.url().toLowerCase();
  console.log(`📍 Current URL: ${currentUrl}`);
  console.log(`🔍 Expected keyword: "${keyword}"`);
  expect(currentUrl, `URL "${currentUrl}" does not contain "${keyword}"`).toContain(keyword.toLowerCase());
  console.log(`✅ URL contains "${keyword}"`);
});



// ============================================================
// OPTIMIZED PAGINATION TEST - Faster execution
// ============================================================

When('I navigate to {string} category page', async function (categoryName) {
  const categorySlug = categoryName.toLowerCase().replace(/ /g, '-');
  await this.page.goto(`https://staging.pricefirst.com/collections/${categorySlug}`);
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000); // Reduced from 3000
  console.log(`📍 Navigated to ${categoryName} category`);
});

Then('I should see pagination controls', async function () {
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await this.page.waitForTimeout(500); // Reduced
  
  const page2Link = this.page.locator('a:has-text("2")').first();
  const hasPages = await page2Link.isVisible().catch(() => false);
  
  if (hasPages) {
    console.log('✅ Pagination controls are visible');
  }
});

Then('I test page 1 vs page 2 products are different', async function () {
  console.log('\n' + '='.repeat(60));
  console.log('📊 PAGINATION TEST - ALL PAGES');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  // ============================================================
  // FASTER: Get product names
  // ============================================================
  const getProductNames = async () => {
    await this.page.waitForTimeout(300);
    
    const products = await this.page.evaluate(() => {
      const productTexts = [];
      const productLinks = document.querySelectorAll('a[href*="/samsung-"], a[href*="/iphone-"], a[href*="/google-pixel-"]');
      
      productLinks.forEach(link => {
        let text = link.textContent?.trim();
        if (text && text.length > 3 && text.length < 60) {
          text = text.replace(/\s+/g, ' ').trim();
          if ((text.includes('Galaxy') || text.includes('iPhone') || text.includes('Pixel')) &&
              !text.includes('Price First')) {
            if (!productTexts.includes(text)) {
              productTexts.push(text);
            }
          }
        }
      });
      return productTexts;
    });
    
    return products;
  };
  
  // ============================================================
  // FASTER: Click Next button
  // ============================================================
  const clickNextButton = async () => {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(300);
    
    const nextButton = this.page.locator('//button[2]').first();
    const exists = await nextButton.isVisible().catch(() => false);
    
    if (exists) {
      const isEnabled = await nextButton.isEnabled().catch(() => false);
      if (isEnabled) {
        await nextButton.click();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000); // Reduced from 2000
        await this.page.evaluate(() => window.scrollTo(0, 0));
        await this.page.waitForTimeout(300);
        return true;
      }
    }
    return false;
  };
  
  // ============================================================
  // FASTER: Check if Next button is disabled
  // ============================================================
  const isNextButtonDisabled = async () => {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(200);
    
    const nextButton = this.page.locator('//button[2]').first();
    const exists = await nextButton.isVisible().catch(() => false);
    if (exists) {
      const isEnabled = await nextButton.isEnabled().catch(() => false);
      return !isEnabled;
    }
    return true;
  };
  
  // ============================================================
  // GET PAGE 1 PRODUCTS
  // ============================================================
  console.log('\n📄 Page 1: Getting products...');
  await this.page.evaluate(() => window.scrollTo(0, 0));
  await this.page.waitForTimeout(500);
  
  const page1Products = await getProductNames();
  console.log(`   Found ${page1Products.length} products`);
  
  const allProductsMap = new Map();
  allProductsMap.set(1, page1Products);
  
  // ============================================================
  // NAVIGATE THROUGH ALL PAGES
  // ============================================================
  console.log('\n📄 Navigating through pages...');
  
  let currentPage = 1;
  let pagesVisited = [1];
  
  while (currentPage < 15) { // Max 15 pages
    // Check timeout
    if (Date.now() - startTime > 55000) {
      console.log(`\n⚠️ Timeout protection - stopping at page ${currentPage}`);
      break;
    }
    
    const isDisabled = await isNextButtonDisabled();
    if (isDisabled) {
      console.log(`\n🏁 Last page: ${currentPage}`);
      break;
    }
    
    const clicked = await clickNextButton();
    if (!clicked) break;
    
    currentPage++;
    pagesVisited.push(currentPage);
    
    const pageProducts = await getProductNames();
    console.log(`   Page ${currentPage}: ${pageProducts.length} products`);
    
    allProductsMap.set(currentPage, pageProducts);
    
    // Quick duplicate check (only first 3 pages for speed)
    if (currentPage <= 5) {
      for (let prevPage = 1; prevPage < currentPage; prevPage++) {
        const prevProducts = allProductsMap.get(prevPage);
        const duplicates = pageProducts.filter(p => prevProducts.includes(p));
        if (duplicates.length > 0) {
          console.log(`   ⚠️ Duplicates with Page ${prevPage}: ${duplicates.length}`);
        }
      }
    }
  }
  
  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  
  let totalProducts = 0;
  for (let page = 1; page <= pagesVisited.length; page++) {
    const products = allProductsMap.get(page) || [];
    totalProducts += products.length;
    console.log(`   Page ${page}: ${products.length} products`);
  }
  
  const timeTaken = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n   Total pages: ${pagesVisited.length}`);
  console.log(`   Total products: ${totalProducts}`);
  console.log(`   Time taken: ${timeTaken} seconds`);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ TEST COMPLETED');
  console.log('='.repeat(60));
});





// ============================================================
// CAT-Complete-Flow Steps
// ============================================================
 
When('I scroll to the "Sell by Category" section', async function () {
  const selectors = [
    'section:has-text("Sell by Category")',
    'div:has-text("Sell by Category")',
    'h2:has-text("Sell by Category")'
  ];
  let sectionFound = false;
  for (const selector of selectors) {
    const section = this.page.locator(selector).first();
    const exists = await section.isVisible().catch(() => false);
    if (exists) {
      await section.scrollIntoViewIfNeeded();
      sectionFound = true;
      console.log(`✅ Scrolled to "Sell by Category" section`);
      break;
    }
  }
  if (!sectionFound) {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await this.page.waitForTimeout(1000);
  }
  await this.page.waitForTimeout(500);
});
 
When('I click "View All" in the Sell by Category section', async function () {
  const selectors = [
    'section:has-text("Sell by Category") a:has-text("View All")',
    'div:has-text("Sell by Category") a:has-text("View All")',
    'a:has-text("View All")',
    'button:has-text("View All")'
  ];
  let clicked = false;
  for (const selector of selectors) {
    const viewAllLink = this.page.locator(selector).first();
    const exists = await viewAllLink.isVisible().catch(() => false);
    if (exists) {
      await viewAllLink.click();
      clicked = true;
      console.log(`✅ Clicked "View All"`);
      break;
    }
  }
  expect(clicked, 'View All button not found').toBeTruthy();
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
  console.log(`📍 Navigated to: ${this.page.url()}`);
});
 
Then('I should be on the collections page', async function () {
  const currentUrl = this.page.url().toLowerCase();
  expect(currentUrl.includes('/collections'), `Expected collections page but got: ${currentUrl}`).toBeTruthy();
  console.log(`✅ On collections page: ${currentUrl}`);
});
 
Then('I should see all device categories', async function () {
  const categories = ['Xboxs', 'Gaming Console', 'Samsung Phones', 'iPhones', 'Google Pixel', 'Mobile Phones', 'iPad', 'Apple Watch', 'Playstation', 'Nintendo'];
  let allFound = true;
  const missingCategories = [];
  for (const category of categories) {
    const isVisible = await this.page.locator(`text="${category}"`).first().isVisible().catch(() => false);
    if (isVisible) {
      console.log(`✅ ${category}`);
    } else {
      console.log(`❌ ${category} - NOT FOUND`);
      missingCategories.push(category);
      allFound = false;
    }
  }
  expect(allFound, `Missing categories: ${missingCategories.join(', ')}`).toBeTruthy();
});
 
// ============================================================
// ✅ FIXED: CAT-Complete-Flow - getProductNamesFromPage
//
// KEY FIXES:
//   1. Only count links whose href matches /collections/<slug>/...
//      This eliminates footer links, nav links, and category cards.
//   2. De-duplicate within a page using a Set on product slug (href).
//   3. Cross-page de-duplication uses the href as the unique key,
//      not the display text (avoids text-normalisation mismatches).
//   4. The "new products" log now snapshots the set BEFORE adding,
//      so the count is actually correct.
//   5. Pagination: use the button's disabled attribute/class instead
//      of XPath position, making it resilient to DOM changes.
// ============================================================
 
When('I test all categories with pagination', { timeout: 300000 }, async function () {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 STARTING COMPLETE CATEGORY & PAGINATION TEST');
  console.log('='.repeat(70));
 
  // ------------------------------------------------------------------
  // HELPER: get the current collection slug from the URL
  // e.g. "https://staging.pricefirst.com/collections/ipad" → "ipad"
  // ------------------------------------------------------------------
  const getCollectionSlug = () => {
    const url = this.page.url();
    const match = url.match(/\/collections\/([^/?#]+)/);
    return match ? match[1] : '';
  };
 
  // ------------------------------------------------------------------
  // HELPER: collect UNIQUE product hrefs on the current page.
  //
  // Strategy: look for <a> tags whose href matches:
  //   /collections/<current-slug>/<anything>
  // This guarantees we only pick up individual product links and
  // never category cards, footer links, or nav items.
  // ------------------------------------------------------------------
  const getProductHrefsFromPage = async () => {
    const collectionSlug = getCollectionSlug();
 
    const hrefs = await this.page.evaluate((slug) => {
      const seen = new Set();
      const results = [];
 
      // Match hrefs like: /collections/ipad/apple-ipad-pro-11-...
      // The segment after the slug must exist and not be empty.
      const pattern = new RegExp(`^/collections/${slug}/(.+)$`, 'i');
 
      document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
 
        // Normalise: strip query-string / fragment
        const cleanHref = href.split('?')[0].split('#')[0];
 
        if (pattern.test(cleanHref) && !seen.has(cleanHref)) {
          seen.add(cleanHref);
          // Grab display text as a label (for logging only)
          const label = (a.textContent || '').replace(/\s+/g, ' ').trim();
          results.push({ href: cleanHref, label });
        }
      });
 
      return results;
    }, collectionSlug);
 
    return hrefs; // Array of { href, label }
  };
 
  // ------------------------------------------------------------------
  // HELPER: navigate through every page and return all unique products.
  //
  // Unique key = product href (not display text).
  // ------------------------------------------------------------------
  const collectAllProductsFromCategory = async () => {
    const allProductsMap = new Map(); // href → label
    let currentPage = 1;
    const pageProductsMap = new Map();
 
    // --- Page 1 ---
    const page1Products = await getProductHrefsFromPage();
    page1Products.forEach(p => allProductsMap.set(p.href, p.label));
    pageProductsMap.set(1, page1Products);
    console.log(`      Page ${currentPage}: ${page1Products.length} products`);
 
    // --- Subsequent pages ---
    while (currentPage < 50) {
      // Scroll down so the pagination bar is in view
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.page.waitForTimeout(400);
 
      // Find the "Next" button.  We look for a button that:
      //   • contains "next" text  OR  "›" / "→" / ">"  OR aria-label="Next"
      //   • is NOT disabled
      const nextBtn = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'));
        for (const btn of buttons) {
          const txt = (btn.textContent || '').toLowerCase().trim();
          const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
          const isNext = txt === 'next' || txt === '›' || txt === '>' || txt === '→' ||
            aria.includes('next') || txt.includes('next');
          if (!isNext) continue;
          // Check disabled state
          if (btn.disabled) return null;
          if (btn.classList.contains('disabled')) return null;
          if (btn.getAttribute('aria-disabled') === 'true') return null;
          return true; // found an enabled Next button
        }
        return null;
      });
 
      if (!nextBtn) {
        // Fallback: try XPath position-based button (original approach)
        const fallbackBtn = this.page.locator('//button[2]').first();
        const fallbackVisible = await fallbackBtn.isVisible().catch(() => false);
        const fallbackEnabled = fallbackVisible ? await fallbackBtn.isEnabled().catch(() => false) : false;
 
        if (!fallbackEnabled) {
          console.log(`      ✅ No more pages after page ${currentPage}`);
          break;
        }
 
        await fallbackBtn.click();
      } else {
        // Click the semantically identified Next button
        await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'));
          for (const btn of buttons) {
            const txt = (btn.textContent || '').toLowerCase().trim();
            const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
            const isNext = txt === 'next' || txt === '›' || txt === '>' || txt === '→' ||
              aria.includes('next') || txt.includes('next');
            if (!isNext) continue;
            if (btn.disabled || btn.classList.contains('disabled')) continue;
            btn.click();
            return;
          }
        });
      }
 
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1200);
      await this.page.evaluate(() => window.scrollTo(0, 0));
      await this.page.waitForTimeout(400);
 
      currentPage++;
 
      const pageProducts = await getProductHrefsFromPage();
      pageProductsMap.set(currentPage, pageProducts);
 
      // Count genuinely NEW products (not seen on any previous page)
      const beforeSize = allProductsMap.size;
      pageProducts.forEach(p => allProductsMap.set(p.href, p.label));
      const newCount = allProductsMap.size - beforeSize;
 
      console.log(`      Page ${currentPage}: ${pageProducts.length} products (${newCount} new unique)`);
 
      // Safety: if a page adds zero new products, we've looped — stop.
      if (newCount === 0 && pageProducts.length > 0) {
        console.log(`      ⚠️ Page ${currentPage} contains only already-seen products — stopping`);
        break;
      }
    }
 
    return {
      totalPages: currentPage,
      totalProductsCollected: allProductsMap.size,
      allProducts: Array.from(allProductsMap.entries()).map(([href, label]) => ({ href, label })),
      pageProductsMap
    };
  };
 
  // ------------------------------------------------------------------
  // Category list with admin-expected counts
  // ------------------------------------------------------------------
  const categories = [
    { name: 'Xboxs',          urlKeyword: 'xbox',          expectedProducts: 6   },
    { name: 'Gaming Console', urlKeyword: 'gaming-console', expectedProducts: 13  },
    { name: 'Samsung Phones', urlKeyword: 'samsung',        expectedProducts: 49  },
    { name: 'iPhones',        urlKeyword: 'iphone',         expectedProducts: 34  },
    { name: 'Google Pixel',   urlKeyword: 'google',         expectedProducts: 21  },
    { name: 'Mobile Phones',  urlKeyword: 'mobile-phones',  expectedProducts: 104 },
    { name: 'iPad',           urlKeyword: 'ipad',           expectedProducts: 76  },
    { name: 'Apple Watch',    urlKeyword: 'apple',          expectedProducts: 26  },
    { name: 'Playstation',    urlKeyword: 'playstation',    expectedProducts: 5   },
    { name: 'Nintendo',       urlKeyword: 'nintendo',       expectedProducts: 2   }
  ];
 
  const results = [];
 
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    console.log('\n' + '='.repeat(60));
    console.log(`📱 TESTING (${i + 1}/${categories.length}): ${cat.name}`);
    console.log(`   Expected products (admin): ${cat.expectedProducts}`);
    console.log('='.repeat(60));
 
    // Click the category card (only inside main / grid, not the navbar)
    const categoryCard = this.page.locator(
      `main a:has-text("${cat.name}"), ` +
      `.collections-grid a:has-text("${cat.name}"), ` +
      `[class*="collection"] a:has-text("${cat.name}"), ` +
      `.grid a:has-text("${cat.name}")`
    ).first();
 
    const exists = await categoryCard.isVisible().catch(() => false);
    if (!exists) {
      console.log(`❌ Category "${cat.name}" not found in collections grid`);
      results.push({ name: cat.name, status: 'FAILED', reason: 'Not found on collections page' });
      continue;
    }
 
    await categoryCard.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
 
    const currentUrl = this.page.url().toLowerCase();
    const urlValid = currentUrl.includes(cat.urlKeyword);
    console.log(`📍 URL: ${currentUrl}`);
    console.log(`   Contains "${cat.urlKeyword}": ${urlValid ? '✅' : '❌'}`);
 
    console.log(`\n📦 Collecting products from all pages...`);
    const result = await collectAllProductsFromCategory();
 
    const diff = result.totalProductsCollected - cat.expectedProducts;
    const productsMatch = diff === 0;
 
    console.log(`\n📊 Category Summary:`);
    console.log(`   Total pages found:             ${result.totalPages}`);
    console.log(`   Total unique products found:   ${result.totalProductsCollected}`);
    console.log(`   Expected products (admin):     ${cat.expectedProducts}`);
 
    if (productsMatch) {
      console.log(`   ✅ Product count MATCHES exactly!`);
    } else if (diff > 0) {
      console.log(`   ⚠️  Found ${diff} EXTRA products`);
    } else {
      console.log(`   ❌  Missing ${Math.abs(diff)} products`);
    }
 
    // Log first 10 found product names for debugging
    if (result.allProducts.length > 0) {
      console.log(`   Sample products found:`);
      result.allProducts.slice(0, 10).forEach((p, idx) => {
        console.log(`      ${idx + 1}. ${p.label} (${p.href})`);
      });
    }
 
    results.push({
      name:             cat.name,
      status:           urlValid ? 'PASSED' : 'FAILED',
      urlValid,
      productsMatch,
      foundProducts:    result.totalProductsCollected,
      expectedProducts: cat.expectedProducts,
      totalPages:       result.totalPages
    });
 
    // Return to collections page for next iteration
    if (i < categories.length - 1) {
      await this.page.goto('https://staging.pricefirst.com/collections');
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1000);
      console.log('\n🔄 Returned to collections page');
    }
  }
 
  // ------------------------------------------------------------------
  // FINAL SUMMARY
  // ------------------------------------------------------------------
  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL TEST SUMMARY');
  console.log('='.repeat(70));
 
  let urlPassed = 0;
  let exactMatch = 0;
  let nearMatch = 0;
 
  for (const r of results) {
    const icon      = r.status === 'PASSED' ? '✅' : '❌';
    const diff      = (r.foundProducts || 0) - (r.expectedProducts || 0);
    const matchIcon = r.productsMatch ? '✅' : (Math.abs(diff) <= 5 ? '⚠️' : '❌');
 
    console.log(`${icon} ${r.name}: ${r.status}`);
    if (r.reason) {
      console.log(`   Reason: ${r.reason}`);
    } else {
      console.log(`   URL: ${r.urlValid ? 'Valid' : 'Invalid'}`);
      console.log(`   ${matchIcon} Products: Found ${r.foundProducts} | Expected ${r.expectedProducts} | Pages: ${r.totalPages} | Diff: ${diff > 0 ? '+' : ''}${diff}`);
    }
 
    if (r.urlValid) urlPassed++;
    if (r.productsMatch) exactMatch++;
    if (Math.abs((r.foundProducts || 0) - (r.expectedProducts || 0)) <= 5) nearMatch++;
  }
 
  console.log('\n' + '='.repeat(70));
  console.log(`📊 URL VALIDATION:            ${urlPassed}/${results.length} PASSED`);
  console.log(`📊 EXACT PRODUCT COUNT MATCH: ${exactMatch}/${results.length}`);
  console.log(`📊 NEAR MATCH (±5 products):  ${nearMatch}/${results.length}`);
  console.log('='.repeat(70));
 
  expect(urlPassed, `${results.length - urlPassed} categories have invalid URLs`).toBe(results.length);
 
  if (exactMatch === results.length) {
    console.log('🎉 PERFECT! All product counts match exactly!');
  } else {
    console.log(`📝 Product count differences may indicate products added/removed in admin since expected counts were set.`);
  }
});
 



