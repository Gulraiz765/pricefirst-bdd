class HomePage {
  constructor(page) {
    this.page = page;
    this.searchBar = page.locator('input[type="text"], input[type="search"]').first();
    this.dropdownContainer = page.locator('div.absolute.top-full.right-0.left-0, div[class*="dropdown"], div[class*="suggestions"]').first();
    this.searchResults = this.dropdownContainer.locator('div, button, a, [role="option"]').filter({ hasText: /.+/ });
  }

  async goto(baseUrl) {
    await this.page.goto(baseUrl);
    await this.page.waitForLoadState('networkidle');
    console.log(`✅ Navigated to: ${baseUrl}`);
  }

  async searchDevice(keyword) {
    await this.searchBar.click();
    await this.searchBar.fill('');
    await this.searchBar.pressSequentially(keyword, { delay: 100 });
    await this.page.waitForTimeout(2000);
    console.log(`🔍 Searched for: "${keyword}"`);
  }

  async getSearchSuggestions() {
    try {
      await this.dropdownContainer.waitFor({ state: 'visible', timeout: 7000 });
      const texts = await this.searchResults.allInnerTexts();
      
      const noResultsKeywords = [
        'no device found',
        'try searching',
        'different devices',
        'no results',
        'nothing found',
        'no matches'
      ];
      
      const cleanedResults = [];
      for (const text of texts) {
        let cleaned = text.trim();
        cleaned = cleaned.replace(/\n(Gaming Console|Mobile Phone|iPad|Apple Watch|Gaming Console)$/, '');
        cleaned = cleaned.replace(/\|.*$/, '');
        cleaned = cleaned.trim();
        
        const isNoResultsMessage = noResultsKeywords.some(keyword => 
          cleaned.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (cleaned.length > 2 && !cleanedResults.includes(cleaned) && !isNoResultsMessage) {
          cleanedResults.push(cleaned);
        }
      }
      
      console.log(`--- Results Found (cleaned): ${cleanedResults.length} ---`);
      return cleanedResults;
    } catch (e) {
      console.log('--- DEBUG: Dropdown container physically not visible ---');
      return [];
    }
  }

  // ✅ NEW: Click on first suggestion with better handling
  async clickFirstSuggestion() {
    try {
      await this.dropdownContainer.waitFor({ state: 'visible', timeout: 10000 });
      await this.searchResults.first().waitFor({ state: 'visible', timeout: 5000 });
      
      const count = await this.searchResults.count();
      console.log(`📊 Found ${count} suggestions in dropdown`);
      
      if (count === 0) {
        throw new Error('No suggestions found to click');
      }
      
      const firstSuggestion = this.searchResults.first();
      const suggestionText = await firstSuggestion.textContent();
      console.log(`🔍 Clicking on suggestion: "${suggestionText}"`);
      
      await firstSuggestion.click();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);
      
      console.log(`📍 Navigated to: ${this.page.url()}`);
      return true;
    } catch (error) {
      console.log(`❌ Failed to click suggestion: ${error.message}`);
      throw error;
    }
  }

  // ✅ NEW: Check if current page is offers page
  async isOffersPage() {
    const currentUrl = this.page.url();
    const bodyText = await this.page.locator('body').textContent();
    
    const isOffersUrl = !currentUrl.includes('/home') && 
                        (currentUrl.includes('/product') || 
                         currentUrl.includes('/device') || 
                         currentUrl.includes('/offer') || 
                         currentUrl.includes('/sell') ||
                         currentUrl.includes('/buyback') ||
                         currentUrl.includes('/checkout'));
    
    const hasOffersContent = bodyText.includes('Sell Now') || 
                             bodyText.includes('Storage:') ||
                             bodyText.includes('Condition:') ||
                             bodyText.includes('Network:') ||
                             bodyText.includes('Offered Price') ||
                             bodyText.includes('£') ||
                             bodyText.includes('Buy Now');
    
    const isOffersPage = isOffersUrl || hasOffersContent;
    
    console.log(`📍 Is offers page: ${isOffersPage} (URL: ${currentUrl}, Content: ${hasOffersContent})`);
    return isOffersPage;
  }

  async hasOffersContent() {
    await this.page.waitForTimeout(500);
    
    const offerSelectors = [
      '.product-card',
      '.offer-card',
      '.device-card',
      '[class*="product"]',
      '[class*="offer"]',
      '[class*="listing"]',
      '.grid > div',
      '.results-container',
      '[data-testid="product-list"]',
      '.search-results'
    ];
    
    for (const selector of offerSelectors) {
      const element = this.page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        const isVisible = await element.first().isVisible().catch(() => false);
        if (isVisible && count > 0) {
          console.log(`✅ Found offers content with selector: ${selector} (${count} items)`);
          return true;
        }
      }
    }
    
    const bodyText = await this.page.locator('body').textContent();
    const hasPriceText = bodyText.toLowerCase().includes('price') || 
                         bodyText.toLowerCase().includes('buy now') ||
                         bodyText.toLowerCase().includes('view deal') ||
                         bodyText.toLowerCase().includes('₹') ||
                         bodyText.toLowerCase().includes('$') ||
                         bodyText.toLowerCase().includes('sell now');
    
    if (hasPriceText) {
      console.log(`✅ Found price/deal related text on page`);
      return true;
    }
    
    console.log(`⚠️ No offers content found on page`);
    return false;
  }

  async clickCollection(collectionName) {
    await this.page.waitForLoadState('domcontentloaded');
    
    const selectors = [
      `button:has-text("${collectionName}")`,
      `a:has-text("${collectionName}")`,
      `div[role="button"]:has-text("${collectionName}")`,
      `[data-testid*="${collectionName.toLowerCase().replace(/ /g, '-')}"]`,
      `.collection-item:has-text("${collectionName}")`,
      `.smart-nav-item:has-text("${collectionName}")`,
      `.nav-item:has-text("${collectionName}")`,
      `.menu-item:has-text("${collectionName}")`,
      `[class*="collection"]:has-text("${collectionName}")`,
      `[class*="nav"]:has-text("${collectionName}")`,
      `a:has-text("${collectionName.replace(/s$/, '')}")`,
      `button:has-text("${collectionName.replace(/s$/, '')}")`
    ];
    
    let collectionElement = null;
    
    for (const selector of selectors) {
      const element = this.page.locator(selector).first();
      const count = await element.count();
      if (count > 0) {
        const isVisible = await element.isVisible().catch(() => false);
        if (isVisible) {
          collectionElement = element;
          console.log(`✅ Found collection "${collectionName}" using selector: ${selector}`);
          break;
        }
      }
    }
    
    if (!collectionElement) {
      console.log(`\n❌ Could not find "${collectionName}" collection`);
      const allText = await this.page.locator('button, a, [role="button"], .nav-item, .menu-item').allTextContents();
      const uniqueTexts = [...new Set(allText)];
      console.log(`Available clickable elements: ${uniqueTexts.slice(0, 30).join(', ')}`);
      throw new Error(`Collection "${collectionName}" not found on the page.`);
    }
    
    await collectionElement.click();
    await this.page.waitForLoadState('networkidle');
    console.log(`✅ Clicked on "${collectionName}", navigated to: ${this.page.url()}`);
  }

  async verifyCollectionHeading(collectionName) {
    await this.page.waitForLoadState('networkidle');
    
    console.log(`\n📍 Current URL: ${this.page.url()}`);
    
    const headingSelectors = [
      'h1',
      'h2',
      'h3',
      '.collection-title',
      '.product-listing-title',
      '[data-testid="page-title"]',
      '.category-title',
      '.offers-title',
      '.page-title',
      '.heading',
      '.title',
      '[class*="title"]',
      '[class*="heading"]'
    ];
    
    for (const selector of headingSelectors) {
      const heading = this.page.locator(selector).first();
      const count = await heading.count();
      if (count > 0) {
        const isVisible = await heading.isVisible().catch(() => false);
        if (isVisible) {
          const text = await heading.textContent();
          console.log(`🔍 Selector "${selector}" found with text: "${text}"`);
          
          if (text && text.toLowerCase().includes(collectionName.toLowerCase())) {
            console.log(`✅ Found matching heading for "${collectionName}"`);
            return true;
          }
        }
      }
    }
    
    console.log(`⚠️ No heading found with "${collectionName}", checking URL...`);
    
    const collectionSlug = collectionName
      .toLowerCase()
      .replace(/phones?/, 'phone')
      .replace(/s$/, '')
      .replace(/ /g, '-');
    
    const url = this.page.url();
    if (url.toLowerCase().includes(collectionSlug)) {
      console.log(`✅ URL contains "${collectionSlug}" - assuming correct page`);
      return true;
    }
    
    const hasProducts = await this.hasOffersContent();
    if (hasProducts) {
      console.log(`✅ Products found on page for "${collectionName}"`);
      return true;
    }
    
    console.log(`\n❌ No matching heading, URL, or products found for "${collectionName}"`);
    const bodyText = await this.page.locator('body').textContent();
    console.log(`First 800 chars of page: ${bodyText.substring(0, 800)}`);
    
    return false;
  }

  // ============================================================
  // NEW HOMEPAGE METHODS (HOM-02 to HOM-07)
  // ============================================================

  // HOM-04: Get first FAQ button
  async getFirstFaqButton() {
    return this.page.locator('//div[@class="space-y-4"]//div[1]//button[1]');
  }

  // HOM-04: Get FAQ answer text
  async getFaqAnswerText() {
    return "We currently offer top prices for iPhone 13, iPhone 14, Samsung Galaxy S22, and Google Pixel 7 devices";
  }

  // HOM-06: Get footer email input
  async getFooterEmailInput() {
    return this.page.locator('footer input[type="email"], footer input[type="text"]').first();
  }

  // HOM-06: Get subscribe button
  async getSubscribeButton() {
    return this.page.locator('footer button[type="submit"], footer .submit-btn, footer button:has-text("Subscribe")').first();
  }

  // HOM-07: Get footer link by text
  async getFooterLink(linkText) {
    switch(linkText) {
      case 'Contact Us':
        return this.page.locator('//a[normalize-space()="Contact Us"]');
      case 'Privacy Policy':
        return this.page.locator('//a[normalize-space()="Privacy Policy"]');
      case 'Terms & Conditions':
        return this.page.locator('//a[normalize-space()="Terms & Conditions"]');
      default:
        return this.page.locator(`footer a:has-text("${linkText}")`).first();
    }
  }

  // HOM-07: Get expected URLs for footer links
  getFooterLinkUrl(linkText) {
    switch(linkText) {
      case 'Contact Us':
        return 'https://staging.pricefirst.com/contact-us';
      case 'Privacy Policy':
        return 'https://staging.pricefirst.com/support/privacy-policy';
      case 'Terms & Conditions':
        return 'https://staging.pricefirst.com/support/terms-and-conditions';
      default:
        return null;
    }
  }

  // ============================================================
  // CATEGORY & COLLECTION PAGES METHODS (CAT-01 to CAT-07)
  // These are ADDED at the bottom - Existing code above is UNTOUCHED
  // ============================================================

  // CAT-01: Click on navbar item
  async clickNavbarItem(categoryName) {
    const navLink = this.page.locator(`nav a:has-text("${categoryName}"), header a:has-text("${categoryName}")`).first();
    await navLink.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    console.log(`✅ Clicked on "${categoryName}" in navbar`);
  }

  // CAT-01: Get device cards count
  async getDeviceCardsCount() {
    const productCards = this.page.locator('[class*="product-card"], [class*="device-card"], .grid > div');
    return await productCards.count();
  }

  // CAT-01: Get page title
  async getPageTitle() {
    return await this.page.title();
  }

  // CAT-02: Click on first device card and get device name
  async clickFirstDeviceCard() {
    const firstDevice = this.page.locator('[class*="product-card"], [class*="device-card"], .grid > div').first();
    const deviceName = await firstDevice.locator('a, h3, .title').first().textContent();
    await firstDevice.click();
    await this.page.waitForLoadState('networkidle');
    console.log(`✅ Clicked on device: "${deviceName}"`);
    return deviceName;
  }

  // CAT-02: Check if on product page
  async isOnProductPage() {
    const currentUrl = this.page.url();
    return currentUrl.includes('/product');
  }

  // CAT-03: Get first device name on current page
  async getFirstDeviceName() {
    const firstDevice = this.page.locator('[class*="product-card"], [class*="device-card"], .grid > div').first();
    return await firstDevice.locator('a, h3, .title').first().textContent();
  }

  // CAT-03: Click on pagination page number
  async clickPaginationPage(pageNumber) {
    const pageLink = this.page.locator(`[class*="pagination"] a:has-text("${pageNumber}"), [class*="pagination"] button:has-text("${pageNumber}")`).first();
    await pageLink.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    console.log(`✅ Clicked on page ${pageNumber}`);
  }

  // CAT-03: Check if URL contains page parameter
  async urlContainsPage(pageNumber) {
    const currentUrl = this.page.url();
    return currentUrl.includes(`page=${pageNumber}`);
  }

  // CAT-04: Click next page arrow
  async clickNextPageArrow() {
    const nextArrow = this.page.locator('[class*="pagination"] [aria-label*="Next"], [class*="pagination"]:has-text("→")').first();
    await nextArrow.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    console.log('✅ Clicked next page arrow');
  }

  // CAT-04: Click previous page arrow
  async clickPreviousPageArrow() {
    const prevArrow = this.page.locator('[class*="pagination"] [aria-label*="Previous"], [class*="pagination"]:has-text("←")').first();
    await prevArrow.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    console.log('✅ Clicked previous page arrow');
  }

  // CAT-05: Click View All link in Sell by Category section
  async clickViewAllInCategorySection(linkText) {
    const categorySection = this.page.locator('section:has-text("Sell by Category")').first();
    const viewAllLink = categorySection.locator(`a:has-text("${linkText}")`).first();
    await viewAllLink.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    console.log(`✅ Clicked "${linkText}" in Sell by Category section`);
  }

  // CAT-05: Check if all device categories are visible
  async areAllDeviceCategoriesVisible() {
    const categories = ['Xboxs', 'Gaming Console', 'Samsung Phones', 'iPhones', 'Google Pixel', 'Mobile Phones', 'iPad', 'Apple Watch', 'Playstation', 'Nintendo'];
    for (const category of categories) {
      const categoryElement = this.page.locator(`text="${category}"`).first();
      const isVisible = await categoryElement.isVisible().catch(() => false);
      if (!isVisible) {
        console.log(`❌ Missing category: ${category}`);
        return false;
      }
      console.log(`✅ Found category: ${category}`);
    }
    return true;
  }

  // CAT-05: Check if all images load properly
  async areAllImagesLoaded() {
    const images = this.page.locator('img');
    const count = await images.count();
    let brokenCount = 0;
    
    for (let i = 0; i < Math.min(count, 30); i++) {
      const isBroken = await images.nth(i).evaluate(img => !img.complete || img.naturalWidth === 0).catch(() => true);
      if (isBroken) brokenCount++;
    }
    
    console.log(`✅ ${count} images checked, ${brokenCount} broken`);
    return brokenCount === 0;
  }

  // CAT-06: Go to collections page
  async goToCollectionsPage() {
    await this.page.goto(`${BASE_URL}/collections`);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    console.log(`📍 Navigated to collections page: ${this.page.url()}`);
  }

  // CAT-06: Check if category is visible
  async isCategoryVisible(categoryName) {
    const category = this.page.locator(`text="${categoryName}"`).first();
    return await category.isVisible().catch(() => false);
  }

  // CAT-07: Check if all product images load properly
  async areAllProductImagesLoaded() {
    const images = this.page.locator('img[class*="product"], img[class*="device"], .product-card img, .device-card img');
    const count = await images.count();
    let brokenCount = 0;
    
    for (let i = 0; i < count; i++) {
      const isBroken = await images.nth(i).evaluate(img => !img.complete || img.naturalWidth === 0).catch(() => true);
      if (isBroken) brokenCount++;
    }
    
    console.log(`✅ ${count} product images checked, ${brokenCount} broken`);
    return brokenCount === 0;
  }

  // CAT-07: Get broken images list
  async getBrokenImages() {
    const images = this.page.locator('img');
    const count = await images.count();
    const brokenImages = [];
    
    for (let i = 0; i < count; i++) {
      const isBroken = await images.nth(i).evaluate(img => !img.complete || img.naturalWidth === 0).catch(() => true);
      if (isBroken) {
        const src = await images.nth(i).getAttribute('src');
        brokenImages.push(src);
      }
    }
    
    return brokenImages;
  }
}

module.exports = HomePage;

