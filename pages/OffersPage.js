class OffersPage {
  constructor(page) {
    this.page = page;

    this.optionButton = (text) =>
      this.page.locator('button').filter({ hasText: text }).first();

    this.sellNowButton = (text = 'Sell Now') =>
      this.page.locator('button').filter({ hasText: text }).first();
  }

  async selectDeviceOption(optionText) {
    const btn = this.optionButton(optionText);
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await this.page.waitForTimeout(800);
  }

  async selectHighestStorage() {
    const storageOrder = ['2TB', '1TB', '512GB', '256GB', '128GB', '64GB', '32GB', '16GB'];

    const storageButtons = this.page.locator('button').filter({ hasText: /^\d+(GB|TB)$/ });

    try {
      await storageButtons.first().waitFor({ state: 'visible', timeout: 8000 });
    } catch {
      console.log('[Storage] No storage buttons found');
      return;
    }

    const count = await storageButtons.count();
    const available = [];
    for (let i = 0; i < count; i++) {
      const text = (await storageButtons.nth(i).textContent())?.trim();
      if (text) available.push(text);
    }
    console.log(`[Storage] Available: ${available.join(', ')}`);

    for (const storage of storageOrder) {
      if (available.includes(storage)) {
        const btn = this.page.locator('button').filter({ hasText: storage }).first();
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
        await this.page.waitForTimeout(800);
        console.log(`[Storage] Selected: ${storage}`);
        return;
      }
    }

    await storageButtons.last().scrollIntoViewIfNeeded();
    await storageButtons.last().click();
    console.log('[Storage] Fallback: last storage selected');
  }

  // Highest offer ka Sell Now — top card ya first button
  async clickHighestOfferSellNow() {
    // Strategy 1: Highest Price Offer badge wale card ka button
    try {
      const badge = this.page.locator(':text("Highest Price Offer")');
      await badge.waitFor({ state: 'attached', timeout: 10000 });

      const highestCard = badge.locator('xpath=ancestor::div[4]');
      const sellNowInCard = highestCard.locator('button').filter({ hasText: 'Sell Now' });

      const cardBtnCount = await sellNowInCard.count();
      if (cardBtnCount > 0) {
        await sellNowInCard.first().evaluate(btn => {
          btn.scrollIntoView({ block: 'center' });
          btn.click();
        });
        console.log('[SellNow] Clicked via Highest Price Offer card');
        return;
      }
    } catch (e) {
      console.log('[SellNow] Badge strategy failed:', e.message);
    }

    // Strategy 2: First Sell Now button — list sorted, pehla = highest
    try {
      const allSellNow = this.page.locator('button').filter({ hasText: 'Sell Now' });
      await allSellNow.first().waitFor({ state: 'attached', timeout: 10000 });

      await allSellNow.first().evaluate(btn => {
        btn.scrollIntoView({ block: 'center' });
        btn.click();
      });
      console.log('[SellNow] Clicked first Sell Now button');
      return;
    } catch (e) {
      console.log('[SellNow] First button strategy failed:', e.message);
    }

    // Strategy 3: Direct DOM click
    await this.page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const sellNow = btns.find(b => b.textContent?.trim() === 'Sell Now');
      if (sellNow) {
        sellNow.scrollIntoView({ block: 'center' });
        sellNow.click();
      }
    });
    console.log('[SellNow] Clicked via evaluate fallback');
  }
  // Legacy clickSellNow — purane steps ke liye
  async clickSellNow(buttonText = 'Sell Now') {
    await this.clickHighestOfferSellNow();
  }

  async waitForOffersVisible() {
    const sellNowBtn = this.page.locator('button').filter({ hasText: 'Sell Now' }).first();
    await sellNowBtn.waitFor({ state: 'attached', timeout: 15000 });

    await this.page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')]
        .find(b => b.textContent?.trim().includes('Sell Now'));
      if (btn) btn.scrollIntoView({ block: 'center' });
    });
    await this.page.waitForTimeout(500);

    return sellNowBtn;
  }

  async getTopOfferPrice() {
    await this.page.waitForTimeout(800);

    // Strategy 1: Highest Price Offer badge
    try {
      const badge = this.page.locator(':text("Highest Price Offer")');
      const badgeCount = await badge.count();

      if (badgeCount > 0) {
        const parent = badge.locator('xpath=ancestor::div[3]');
        const parentText = await parent.textContent();
        const match = parentText?.match(/£(\d{2,4}(?:\.\d{2})?)/);
        if (match) {
          const price = parseFloat(match[1]);
          if (price > 0 && price < 10000) {
            console.log(`[OffersPage] Badge price: £${price}`);
            return price;
          }
        }
      }
    } catch (e) {
      console.log('[OffersPage] Badge strategy failed');
    }

    // Strategy 2: Sell Now buttons — unique prices
    try {
      const sellNowBtns = this.page.locator('button').filter({ hasText: 'Sell Now' });
      await sellNowBtns.first().waitFor({ state: 'attached', timeout: 8000 });
      const btnCount = await sellNowBtns.count();

      const seenPrices = new Set();
      const prices = [];

      for (let i = 0; i < btnCount; i++) {
        const btn = sellNowBtns.nth(i);
        const rowPrice = await btn.evaluate((el) => {
          let parent = el.parentElement;
          for (let j = 0; j < 5; j++) {
            if (!parent) break;
            const match = (parent.textContent || '').match(/£(\d{2,4}(?:\.\d{2})?)/);
            if (match) return parseFloat(match[1]);
            parent = parent.parentElement;
          }
          return null;
        });

        if (rowPrice && rowPrice > 0 && rowPrice < 10000 && !seenPrices.has(rowPrice)) {
          seenPrices.add(rowPrice);
          prices.push(rowPrice);
        }
      }

      if (prices.length > 0) {
        const top = Math.max(...prices);
        console.log(`[OffersPage] Unique prices: ${[...seenPrices]}, top: £${top}`);
        return top;
      }
    } catch (e) {
      console.log('[OffersPage] Row strategy failed:', e.message);
    }

    // Strategy 3: Fallback
    const allText = await this.page.locator('body').textContent();
    const matches = [...(allText?.matchAll(/£(\d{2,4}(?:\.\d{2})?)/g) || [])];
    const numbers = matches
      .map(m => parseFloat(m[1]))
      .filter(n => !isNaN(n) && n > 10 && n < 10000);
    const result = numbers.length ? Math.max(...numbers) : 0;
    console.log(`[OffersPage] Fallback: £${result}`);
    return result;
  }
}

module.exports = OffersPage;





