@api @api-offers
Feature: Offers & Pricing API
  As a tester
  I want to verify the offers and pricing API
  So that device prices are returned correctly for all conditions and storage

  Background:
    Given the API base URL is configured

  @api-offers-valid
  Scenario Outline: Valid device slug returns offers with prices
    When I send a GET request to "/api/offers" for device "<slug>"
    Then the response status should be 200
    And the response should contain at least 1 offer
    And each offer should have "buyerName", "price", and "currency" fields
    And all prices should be greater than 0

    Examples:
      | slug                  |
      | apple-iphone-13       |
      | samsung-galaxy-s23    |
      | google-pixel-7        |

  @api-offers-condition
  Scenario Outline: Condition filter returns correct price tier
    When I send a GET request to "/api/offers" for device "apple-iphone-13" with condition "<condition>"
    Then the response status should be 200
    And the top offer price should reflect "<condition>" tier

    Examples:
      | condition |
      | Excellent |
      | Very Good |
      | Good      |
      | Fair      |

  @api-offers-price-order
  Scenario: Offers are returned in descending price order
    When I send a GET request to "/api/offers" for device "apple-iphone-13"
    Then the response status should be 200
    And the offers should be sorted by price in descending order

  @api-offers-invalid-slug
  Scenario: Invalid device slug returns 404
    When I send a GET request to "/api/offers" for device "not-a-real-device-xyz"
    Then the response status should be 404
    And the response body should contain an error message

  @api-offers-schema
  Scenario: Offers response matches expected schema
    When I send a GET request to "/api/offers" for device "apple-iphone-13"
    Then the response status should be 200
    And the response body should match the offers schema
