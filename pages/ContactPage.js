class ContactPage {
  constructor(page) {
    this.page = page;
    
    // Form fields
    this.nameInput = page.locator('input[name="name"], input[placeholder*="Name"]').first();
    this.emailInput = page.locator('input[type="email"], input[name="email"]').first();
    this.messageInput = page.locator('div[contenteditable="true"], [role="textbox"], div:below(:text("Message"))').first();
    this.submitButton = page.locator('button:has-text("Send Message")').first();
    
    // Universal Error Locator
    this.errorSpanSelector = 'span.text-red-600';
    
    // Success message locators
    this.successMessageSelector = '.success, [class*="success"], .alert-success, .toast-success, text=Thank you, text=Message sent, text=Submitted';
  }

  async goto(baseUrl) {
    await this.page.goto(`${baseUrl}/contact-us`);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  async fillName(name) {
    await this.nameInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.nameInput.fill(name);
    console.log(`✅ Filled name: "${name}"`);
  }

  async fillEmail(email) {
    await this.emailInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.emailInput.fill(email);
    console.log(`✅ Filled email: "${email}"`);
  }

  async fillMessage(message) {
    await this.messageInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.messageInput.click();
    await this.page.waitForTimeout(300);
    await this.messageInput.evaluate(el => {
      if (el.textContent) el.textContent = '';
    });
    await this.messageInput.type(message, { delay: 30 });
    console.log(`✅ Filled message: "${message}"`);
  }

  async submitForm() {
    await this.submitButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.submitButton.click();
    await this.page.waitForTimeout(2000);
    console.log(`✅ Submitted form`);
  }

  async getFieldError(fieldName) {
    const labelSelector = `label:has-text("${fieldName}")`;
    const fieldError = this.page.locator(labelSelector).locator(this.errorSpanSelector);

    if (await fieldError.isVisible().catch(() => false)) {
      const errorMessage = await fieldError.textContent();
      console.log(`✅ Found error for ${fieldName}: "${errorMessage.trim()}"`);
      return errorMessage.trim();
    }
    
    console.log(`⚠️ No error visible for field: ${fieldName}`);
    return null;
  }

  async hasRequiredFieldErrors() {
    const errorCount = await this.page.locator(this.errorSpanSelector).count();
    const hasErrors = errorCount > 0;
    console.log(`🔍 Required field errors present: ${hasErrors}`);
    return hasErrors;
  }

  async hasEmailValidationError() {
    await this.page.waitForTimeout(500);
    
    // Check for email-specific error message
    const emailError = this.page.locator('label:has-text("Email")').locator(this.errorSpanSelector);
    
    if (await emailError.isVisible().catch(() => false)) {
      const errorText = await emailError.textContent();
      console.log(`✅ Email validation error: "${errorText}"`);
      return true;
    }
    
    // Check for any error containing email-related text
    const allErrors = await this.page.locator(this.errorSpanSelector).allTextContents();
    for (const error of allErrors) {
      if (error.toLowerCase().includes('email') || 
          error.toLowerCase().includes('valid') ||
          error.toLowerCase().includes('invalid')) {
        console.log(`✅ Email validation error found: "${error}"`);
        return true;
      }
    }
    
    // Special case: user@domain - technically missing TLD
    const emailValue = await this.emailInput.inputValue();
    if (emailValue === 'user@domain' && !emailValue.includes('.com') && !emailValue.includes('.co')) {
      console.log(`⚠️ "user@domain" is missing TLD - should be invalid`);
      // Most validators would catch this, but if not, we note it
      return false;
    }
    
    console.log(`⚠️ No email validation error found`);
    return false;
  }

  async hasSuccessMessage() {
    await this.page.waitForTimeout(1000);
    
    // Check for success message element
    const successElement = this.page.locator(this.successMessageSelector).first();
    if (await successElement.isVisible().catch(() => false)) {
      const text = await successElement.textContent();
      console.log(`✅ Success message found: "${text}"`);
      return true;
    }
    
    // Check if form fields were cleared (indicates successful submission)
    const nameValue = await this.nameInput.inputValue().catch(() => '');
    const emailValue = await this.emailInput.inputValue().catch(() => '');
    const messageText = await this.messageInput.evaluate(el => el.textContent || '').catch(() => '');
    
    if (nameValue === '' && emailValue === '' && messageText.trim() === '') {
      console.log(`✅ Form cleared - successful submission confirmed`);
      return true;
    }
    
    // Check for URL change (if redirected)
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/contact-us')) {
      console.log(`✅ Redirected to: ${currentUrl} - submission successful`);
      return true;
    }
    
    // Check for any success indicator in page text
    const pageText = await this.page.locator('body').textContent();
    if (pageText.includes('thank') || pageText.includes('submitted') || pageText.includes('received')) {
      console.log(`✅ Success indicator found in page text`);
      return true;
    }
    
    console.log(`⚠️ No success message found`);
    return false;
  }
}

module.exports = ContactPage;









