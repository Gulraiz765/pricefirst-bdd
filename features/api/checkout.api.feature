@api @api-checkout
Feature: Checkout API
  As a tester
  I want to verify the checkout submission API
  So that orders are created correctly with valid data

  Background:
    Given the API base URL is configured

  @api-checkout-success
  Scenario: Valid checkout payload returns order confirmation
    When I POST to "/api/checkout" with valid checkout data
    Then the response status should be 200
    And the response should contain an "orderId"
    And the response should contain a "confirmationNumber"
    And the response body should match the checkout success schema

  @api-checkout-missing-name
  Scenario: Checkout with missing name returns validation error
    When I POST to "/api/checkout" with missing "fullName"
    Then the response status should be 422
    And the response error should mention "fullName"

  @api-checkout-missing-email
  Scenario: Checkout with missing email returns validation error
    When I POST to "/api/checkout" with missing "email"
    Then the response status should be 422
    And the response error should mention "email"

  @api-checkout-invalid-email
  Scenario Outline: Checkout with invalid email format returns error
    When I POST to "/api/checkout" with email "<invalid_email>"
    Then the response status should be 422
    And the response error should mention "email"

    Examples:
      | invalid_email  |
      | notanemail     |
      | missing@       |
      | @nodomain.com  |

  @api-checkout-missing-phone
  Scenario: Checkout with missing phone returns validation error
    When I POST to "/api/checkout" with missing "phone"
    Then the response status should be 422
    And the response error should mention "phone"

  @api-checkout-bank-invalid
  Scenario Outline: Checkout with invalid bank details returns error
    When I POST to "/api/checkout" with sort code "<sort_code>" and account number "<account_number>"
    Then the response status should be 422

    Examples:
      | sort_code | account_number |
      |           |                |
      | 12345     | 12345678       |
      | 123456    |                |
      | 123456    | 1234567        |

  @api-checkout-bank-valid
  Scenario: Checkout with valid bank details succeeds
    When I POST to "/api/checkout" with sort code "123456" and account number "12345678"
    Then the response status should be 200
    And the response should contain an "orderId"

  @api-checkout-empty-body
  Scenario: Checkout with empty body returns 400
    When I POST to "/api/checkout" with an empty body
    Then the response status should be 400
    And the response body should contain an error message
