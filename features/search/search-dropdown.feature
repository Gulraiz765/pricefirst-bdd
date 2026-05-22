Feature: TC-07 Search Dropdown Validation
  As a user
  I want the search bar to suggest correct models
  So that I can find my device quickly

  @search-dropdown
  Scenario Outline: Search dropdown shows correct suggestions
    Given I am on the PriceFirst home page
    When I type "<keyword>" in the search bar
    Then the search dropdown should appear
    And suggestions should be relevant to "<keyword>"

    Examples:
      | keyword |
      | iPhone  |
      | iPad    |
      | Pixel   |
      | Samsung |

  @search-no-results
  Scenario: Search with no results shows empty state
    Given I am on the PriceFirst home page
    When I type "ZZZZNOTADEVICE999" in the search bar
    Then the search dropdown should show no results message

    