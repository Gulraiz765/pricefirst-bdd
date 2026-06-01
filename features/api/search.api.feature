@api @api-search
Feature: Search API
  As a tester
  I want to verify the PriceFirst search API
  So that device search works correctly at the backend level

  Background:
    Given the API base URL is configured

  @api-search-results
  Scenario Outline: Search returns relevant device results
    When I send a GET request to "/api/search" with query "<keyword>"
    Then the response status should be 200
    And the response should contain devices matching "<keyword>"
    And each result should have "title", "slug", and "price" fields

    Examples:
      | keyword        |
      | iPhone 13      |
      | Samsung S23    |
      | Google Pixel 7 |
      | iPad Pro       |

  @api-search-empty
  Scenario: Search with no matches returns empty array
    When I send a GET request to "/api/search" with query "ZZZZNOTADEVICE999"
    Then the response status should be 200
    And the response results array should be empty

  @api-search-missing-param
  Scenario: Search without query param returns error
    When I send a GET request to "/api/search" with no query params
    Then the response status should be 400
    And the response body should contain an error message
