@regression @guest-flow
Feature: End-to-End Buy-Back Flow

  As a guest user
  I want to find my device and see its value
  So that I can complete a sale journey without logging in

  Background:
    Given I am on the PriceFirst home page
    When I search for "iPhone 15 Pro Max" in the search bar
    And I select "iPhone 15 Pro Max 1TB" from the search dropdown results
    And I select the "Unlocked" network option
    And I select "Excellent" condition on the offer page
    And I click "Sell Now" on the highest price offer
    Then I should be redirected to the Checkout page

  @checkout-empty-form
  Scenario: Checkout form - empty fields show validation errors
    When I click the "Complete Your Order" button without filling any fields
    Then I should see validation errors for:
      | field          | error message            |
      | Full Name      | Full name is required    |
      | Email          | Email is required        |
      | Phone Number   | Phone number is required |
      | City           | City is required         |
      | Payment Method | Invalid payment method   |
      | Postage Method | Invalid postage method   |

  @checkout-name-validation
  Scenario Outline: Checkout form - name field validation
    When I fill the checkout form with valid details except name
    And I fill the name field with "<name>"
    And I click the "Complete Your Order" button
    Then I should see a validation error for name containing "<error>"

    Examples:
      | name                                                          | error                                |
      |                                                               | Full name is required                |
      | J                                                             | Name must be at least 2 characters   |
      | A very very long name that exceeds fifty characters limit test | Name must be less than 50 characters |
      | John123                                                       | Name can only contain letters        |
      | John@Doe                                                      | Name can only contain letters        |

  @checkout-email-validation
  Scenario Outline: Checkout form - email field validation
    When I fill the checkout form with valid details except email
    And I fill the email field with "<email>"
    And I click the "Complete Your Order" button
    Then I should see a validation error for email containing "<error>"

    Examples:
      | email            | error                |
      |                  | Email is required    |
      | john.doe         | Invalid email format |
      | john.doe@example | Invalid email format |

  @checkout-phone-validation
  Scenario Outline: Checkout form - phone number validation
    When I fill the checkout form with valid details except phone
    And I fill the phone number field with "<phone>"
    And I click the "Complete Your Order" button
    Then I should see a validation error for phone containing "<error>"

    Examples:
      | phone       | error                             |
      |             | Phone number is required          |
      | abcdefghijk | Please enter a valid phone number |

  @checkout-payment-bank-validation
  Scenario Outline: Checkout form - bank account details validation
    When I fill the checkout form with valid details
    And I select "Bank" as payment method
    Then I should see fields for Sort Code and Account Number
    When I fill sort code with "<sort_code>" and account number with "<account_number>"
    And I click the "Complete Your Order" button
    Then I should see "<expected_result>" for bank details

    Examples:
      | sort_code | account_number | expected_result |
      |           |                | error           |
      | 12345     | 12345678       | error           |
      | 123456    |                | error           |
      | 123456    | 1234567        | error           |
      | 123456    | 12345678       | success         |

  @checkout-payment-paypal-validation
  Scenario Outline: Checkout form - PayPal email validation
    When I fill the checkout form with valid details
    And I select "PayPal" as payment method
    And I enter PayPal email "<paypal_email>"
    And I click the "Complete Your Order" button
    Then I should see a paypal validation error

    Examples:
      | paypal_email |
      |              |
      | testemail    |
      | test@        |
      | @paypal.com  |

  @checkout-success
  Scenario: Checkout form - valid data submits successfully
    When I fill the checkout form with valid details
    And I click the "Complete Your Order" button
    Then I should see the order confirmation
