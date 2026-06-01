Feature: Products Search API
  As a user
  I want to search for products
  So that I can find devices to sell

  Background:
    Given the API base URL is configured

  @api @smoke
  Scenario: Search for iPhone 13 returns results
    When I search for products with query "iPhone 13"
    Then the response status should be 200
    And the response should contain products
    And each product should have "name", "slug", and "brand" fields

  @api @smoke
  Scenario: Search for Samsung Galaxy returns results
    When I search for products with query "Samsung Galaxy S23"
    Then the response status should be 200
    And the response should contain products

  @api @regression
  Scenario: Search with empty query returns trending products
    When I search for products with query ""
    Then the response status should be 200
    And the response should contain products

  @api @negative
  Scenario: Search with very long query string returns results or empty array
    When I search for products with query "this is a very long search query that no product will match xyz123"
    Then the response status should be 200

  @api @regression
  Scenario: Search with limit parameter returns limited results
    When I search for products with query "iPhone" and limit 5
    Then the response status should be 200
    And the number of products should be less than or equal to 5