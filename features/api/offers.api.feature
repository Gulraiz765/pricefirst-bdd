Feature: Offers & Pricing API
  As a user
  I want to get offers for my device

  Background:
    Given the API base URL is configured

  @api @smoke @skip
  Scenario Outline: Valid device slug returns offers with prices
    When I send a GET request to "/api/offers" for device "<slug>"
    Then the offers response status should be 200
    And the response should contain at least 1 offer
    And each offer should have "buyerName", "price", and "currency" fields
    And all prices should be greater than 0

    Examples:
      | slug                  |
      | apple-iphone-13       |
      | samsung-galaxy-s23    |
      | google-pixel-7        |

  @api @regression @skip
  Scenario Outline: Condition filter returns correct price tier
    When I send a GET request to "/api/offers" for device "apple-iphone-13" with condition "<condition>"
    Then the offers response status should be 200
    And the top offer price should reflect "<condition>" tier

    Examples:
      | condition |
      | Excellent |
      | Good      |
      | Fair      |

  @api @regression @skip
  Scenario: Offers are returned in descending price order
    When I send a GET request to "/api/offers" for device "apple-iphone-13"
    Then the offers response status should be 200
    And the offers should be sorted by price in descending order

  @api @negative
  Scenario: Invalid device slug returns 404
    When I send a GET request to "/api/offers" for device "not-a-real-device-xyz"
    Then the offers response status should be 404
    And the offers response body should contain an error message

  @api @regression @skip
  Scenario: Offers response matches expected schema
    When I send a GET request to "/api/offers" for device "apple-iphone-13"
    Then the offers response status should be 200
    And the response body should match the offers schema
