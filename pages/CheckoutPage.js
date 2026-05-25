class CheckoutPage {
  constructor(page) {
    this.page = page;

    // Form fields
    this.fullName = page.getByRole('textbox', { name: 'Name*' });
    this.email = page.getByRole('textbox', { name: 'Email*' });
    this.phone = page.getByRole('textbox', { name: 'Mobile Phone*' });
    this.postcode = page.getByRole('textbox', { name: 'Post Code*' });
    this.city = page.locator('input[type="text"][placeholder*="city" i], input[name*="city" i], input[id*="city" i]').first();

    // Address selection
    this.addressInput = page.locator('#react-select-2-input');
    this.addressItems = page.getByRole('option');

    // Payment
    this.sortCode = page.getByRole('textbox', { name: 'Sort Code' });
    this.accountNumber = page.getByRole('textbox', { name: 'Bank Account Number' });

    // Postage
    this.postagePack = page.locator('label:has-text("Send me a postage pack")').first();
    this.postageLabel = page.locator('label:has-text("Receive a postage label"), label:has-text("Postage Label")').first();

    // Buttons
    this.completeOrderButton = page.getByRole('button', { name: 'Complete Your Order' });
  }
  

  async waitForCheckoutPage() {
    await this.page.waitForURL(/.*checkout.*/, { timeout: 15000 });
    await this.page.waitForLoadState('networkidle');
    await this.page.locator('text=Checkout').first().waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Checkout page loaded');
  }

  async fillName(name) {
    await this.fullName.waitFor({ state: 'visible', timeout: 10000 });
    await this.fullName.fill(name);
    console.log(`📝 Name: ${name}`);
  }

  async fillEmail(email) {
    await this.email.waitFor({ state: 'visible', timeout: 10000 });
    await this.email.fill(email);
    console.log(`📝 Email: ${email}`);
  }

  async fillPhone(phone) {
    await this.phone.waitFor({ state: 'visible', timeout: 10000 });
    await this.phone.fill(phone);
    console.log(`📝 Phone: ${phone}`);
  }

  async fillPostcode(postcode) {
    await this.postcode.waitFor({ state: 'visible', timeout: 10000 });
    await this.postcode.fill(postcode);
    console.log(`📝 Postcode: ${postcode}`);
  }

  async fillCity(city) {
    try {
      await this.city.waitFor({ state: 'visible', timeout: 5000 });
      const currentValue = await this.city.inputValue().catch(() => '');
      if (currentValue && currentValue.trim().length > 0) {
        console.log(`✅ City already has value: "${currentValue}"`);
        return;
      }
      await this.city.click({ clickCount: 3 });
      await this.city.fill('');
      await this.city.fill(city);
      console.log(`📝 City filled: ${city}`);
    } catch (error) {
      console.log(`⚠️ City fill failed: ${error.message}`);
    }
  }

  async selectRandomAddressFromDropdown() {
    try {
      await this.addressInput.click();
      await this.page.waitForTimeout(1000);
      await this.page.waitForSelector('[role="option"]', { timeout: 10000 });
      
      const specificAddress = this.page.getByText('55 Bury New Road');
      if (await specificAddress.count() > 0) {
        await specificAddress.click();
        console.log('📝 Address selected: 55 Bury New Road');
      } else {
        await this.addressItems.first().click();
        console.log('📝 Address selected from dropdown');
      }
      
      await this.page.waitForTimeout(3000);
      
      const cityValue = await this.city.inputValue().catch(() => '');
      if (!cityValue || cityValue.trim().length === 0) {
        await this.fillCity('Manchester');
      }
    } catch (error) {
      console.log(`⚠️ Address selection failed: ${error.message}`);
    }
  }

  async selectPayment(method = 'Bank') {
    try {
      await this.page.evaluate(() => window.scrollBy(0, 500));
      await this.page.waitForTimeout(500);

      if (method === 'Bank') {
        const bankLabel = this.page.locator('label:has-text("Bank")').first();
        await bankLabel.waitFor({ state: 'visible', timeout: 10000 });
        await bankLabel.click({ force: true });
      } else if (method === 'PayPal') {
        const paypalLabel = this.page.locator('label:has-text("PayPal")').first();
        await paypalLabel.waitFor({ state: 'visible', timeout: 10000 });
        await paypalLabel.click({ force: true });
      }

      console.log(`✅ Selected payment: ${method}`);
      await this.page.waitForTimeout(2000);
    } catch (error) {
      console.log(`⚠️ Payment selection failed: ${error.message}`);
    }
  }

  async fillBankDetails({ accountNumber, sortCode }) {
    try {
      await this.sortCode.waitFor({ state: 'visible', timeout: 10000 });
      if (sortCode !== undefined && sortCode !== '') {
        await this.sortCode.fill(sortCode);
      }
      if (accountNumber !== undefined && accountNumber !== '') {
        await this.accountNumber.fill(accountNumber);
      }
      console.log(`✅ Bank details: sortCode="${sortCode}", accountNumber="${accountNumber}"`);
    } catch (error) {
      console.log(`⚠️ Bank details fill failed: ${error.message}`);
    }
  }

  async isBankFieldsVisible() {
    return await this.accountNumber.isVisible() && await this.sortCode.isVisible();
  }

  async selectPostage(option = 'Send me a postage pack') {
    try {
      if (option.toLowerCase().includes('postage pack')) {
        await this.postagePack.waitFor({ state: 'visible', timeout: 10000 });
        await this.postagePack.click({ force: true });
      } else if (option.toLowerCase().includes('postage label') || option.toLowerCase().includes('label')) {
        await this.postageLabel.waitFor({ state: 'visible', timeout: 10000 });
        await this.postageLabel.click({ force: true });
      }
      console.log(`✅ Selected postage: ${option}`);
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.log(`⚠️ Postage selection failed: ${error.message}`);
    }
  }

  async completeOrder() {
    console.log('🔘 Clicking Complete Order button...');
    await this.completeOrderButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.completeOrderButton.click();
    console.log('✅ Order button clicked');
    await this.page.waitForTimeout(5000);
    console.log(`📍 Final URL: ${this.page.url()}`);
  }

  async isOnSuccessPage() {
    const url = this.page.url();
    return url.includes('thank-you') || url.includes('confirmation') || url.includes('success') || url.includes('order-complete');
  }

  async isOnCheckoutPage() {
    return this.page.url().includes('checkout');
  }

  async getSuccessMessage() {
    const successText = this.page.locator('text=/thank|success|complete|confirmed|order placed/i').first();
    if (await successText.isVisible().catch(() => false)) {
      return await successText.textContent();
    }
    return null;
  }

  async getFieldValidationError(fieldName) {
    const bodyText = await this.page.locator('body').textContent();
    if (fieldName === 'email') {
      if (bodyText.includes('Email is required')) return 'Email is required';
      if (bodyText.includes('valid email')) return 'Please enter a valid email';
    }
    if (fieldName === 'name') {
      if (bodyText.includes('Full name is required')) return 'Full name is required';
      if (bodyText.includes('at least 2 characters')) return 'Name must be at least 2 characters';
      if (bodyText.includes('less than 50 characters')) return 'Name must be less than 50 characters';
      if (bodyText.includes('only contain letters')) return 'Name can only contain letters';
    }
    if (fieldName === 'phone') {
      if (bodyText.includes('Phone number is required')) return 'Phone number is required';
      if (bodyText.includes('valid phone number')) return 'Please enter a valid phone number';
    }
    return null;
  }

  async fillPaypalEmail(email) {
    try {
      const paypalInput = this.page.locator('input[type="email"][placeholder*="PayPal" i], input[name*="paypal" i]').first();
      await paypalInput.waitFor({ state: 'visible', timeout: 10000 });
      await paypalInput.fill(email);
      console.log(`📝 PayPal email: ${email}`);
    } catch (error) {
      console.log(`⚠️ PayPal email fill failed: ${error.message}`);
    }
  }
}

module.exports = CheckoutPage;

