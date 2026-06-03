Feature: Checkout Session API
  As a guest user
  I want to create and manage checkout sessions

  Background:
    Given the API base URL is configured

  @api @smoke
  Scenario: Valid checkout payload returns order confirmation
    When I POST to "/api/checkout-session" with valid checkout data
    Then the checkout response status should be 200
    And the response should have resumeToken and recoveryToken

  @api @negative
  Scenario: Checkout with missing product returns validation error
    When I POST to "/api/checkout-session" with missing "product"
    Then the checkout response status should be 422
    And the checkout response error should mention "product"

  @api @negative
  Scenario: Checkout with missing vendor returns validation error
    When I POST to "/api/checkout-session" with missing "vendor"
    Then the checkout response status should be 422
    And the checkout response error should mention "vendor"

  @api @negative
  Scenario Outline: Checkout with invalid email format returns error
    When I POST to "/api/checkout-session" with invalid email "<email>"
    Then the checkout response status should be 422
    And the checkout response error should mention "email"

    Examples:
      | email           |
      | notanemail      |
      | missing@        |
      | @nodomain.com   |
      | user@           |
      | test@test       |

  @api @regression
  Scenario: Retrieve existing checkout session via page
    Given I have created a checkout session
    When I retrieve the checkout session using resume token
    Then the checkout response status should be 200
    And the response should contain "token"

  @api @negative
  Scenario: Checkout with empty body returns 422
    When I POST to "/api/checkout-session" with an empty body
    Then the checkout response status should be 422
    And the checkout response body should contain an error message
