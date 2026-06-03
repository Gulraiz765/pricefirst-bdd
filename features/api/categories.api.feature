Feature: Categories API
  As a user
  I want to view product categories
  So that I can browse products

  Background:
    Given the API base URL is configured

  @api @smoke
  Scenario: Get all categories returns 200
    When I send a GET request to "/api/categories"
    Then the categories response status should be 200
    And the response should contain categories list

  @api @smoke
  Scenario: Get categories with brands and products
    When I send a GET request to "/api/categories/brands/products"
    Then the categories response status should be 200
    And the response should contain categories with brands list

  @api @regression
  Scenario: Get products by category slug
    When I get products for category "mobile-phone"
    Then the categories response status should be 200
    And the response should contain products list