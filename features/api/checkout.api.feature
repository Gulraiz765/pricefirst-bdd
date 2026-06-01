Feature: Checkout Session API
  As a guest user
  I want to create and manage checkout sessions
  So that I can save my checkout progress and resume later

  Background:
    Given the API base URL is configured

  @api @smoke @checkout-valid
  Scenario: Valid checkout payload returns order confirmation
    When I POST to "/api/checkout-session" with valid checkout data
    Then the response status should be 200
    And the response should have resumeToken and recoveryToken

  @api @negative @checkout-missing
  Scenario: Checkout with missing name returns validation error
    When I POST to "/api/checkout-session" with missing "fname"
    Then the response status should be 422
    And the response error should mention "name"

  @api @negative @checkout-missing
  Scenario: Checkout with missing email returns validation error
    When I POST to "/api/checkout-session" with missing "email"
    Then the response status should be 422
    And the response error should mention "email"

  @api @negative @checkout-invalid
  Scenario Outline: Checkout with invalid email format returns error
    When I POST to "/api/checkout-session" with invalid email "<email>"
    Then the response status should be 422
    And the response error should mention "email"

    Examples:
      | email           |
      | notanemail      |
      | missing@        |
      | @nodomain.com   |
      | user@           |
      | test@test       |

  @api @regression
  Scenario: Retrieve existing checkout session
    Given I have created a checkout session
    When I retrieve the checkout session using resume token
    Then the response status should be 200
    And the response should contain "data"

  @api @negative
  Scenario: Checkout with empty body returns 400
    When I POST to "/api/checkout-session" with an empty body
    Then the response status should be 400
    And the response body should contain an error message