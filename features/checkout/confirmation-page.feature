Feature: Order Confirmation Page

  Background:
    Given I am on the PriceFirst home page
    When I search for "iPhone 15 Pro Max" in the search bar
    And I select "iPhone 15 Pro Max 1TB" from the search dropdown results
    And I select the "Unlocked" network option
    And I select "Excellent" condition on the offer page
    And I click "Sell Now" on the highest price offer
    Then I should be redirected to the Checkout page
    When I fill the checkout form with valid details
    And I click the Complete Your Order button

  @CNF-01
  Scenario: Order summary shows correct device details
    Then I should see the device name on confirmation page
    And I should see the storage size on confirmation page
    And I should see the condition on confirmation page
    And I should see the network option on confirmation page
    And I should see the buyer name on confirmation page
    And I should see the Trustpilot widget on confirmation page
    And I should see the price "£0.00" on confirmation page

  @CNF-02
  Scenario: Customer information displayed correctly
    Then I should see the "Customer Information" section
    And I should see the contact email entered at checkout
    And I should see the phone number entered at checkout
    And I should see masked bank or PayPal information

  @CNF-03
  Scenario: Shipping information shows correct address
    Then I should see "Shipping Information" on confirmation page
    And I should see the address entered at checkout under "From"
    And no other address should be shown on the page

  @CNF-04
  Scenario: iCloud warning appears for Apple devices
    Then I should see a yellow warning banner about iCloud or Apple ID
    And the banner should say "Please remove your iCloud account before sending your device"
    And the banner should include explanatory text about iCloud-locked devices

  @CNF-06
  Scenario: What to do next steps are visible
    Then I should see "What to do next?" section
    And I should see "Order Confirmation" step with an icon and description
    And I should see "Send Your Device" step with an icon and description
    And I should see "Get Paid Fast" step with an icon and description
    And all step icons should load correctly

  @CNF-07
  Scenario: Page shows thank you message
    Then the page H1 heading should read "Thank You for your order"

 @CNF-08
Scenario: Direct access to confirmation URL without an order redirects
  Given I navigate directly to the confirmation URL without completing a checkout
  Then I should be redirected away from the confirmation page