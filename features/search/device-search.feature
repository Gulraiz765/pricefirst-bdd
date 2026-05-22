Feature: TC-02 Device Search and Filtering
  As a user
  I want to search and filter devices
  So that I can find my specific phone model quickly

  Background:
    Given I am on the PriceFirst home page

  @search-suggestions
  Scenario Outline: Search and Navigate for various gadgets
    When I type "<keyword>" in the search bar
    Then I should see search suggestions containing "<keyword>"
    When I click on the first suggestion
    Then I should be navigated to the offers page

    Examples:
      | keyword        |
      | Samsung S23    |
      | Google Pixel 7 |
      | iPad Pro       |
      | Apple Watch    |
      | PlayStation 5  |
      | Nintendo Switch|
      | Sony           |

  @collection-navigation
  Scenario Outline: Navigate via Smart Collections Logic
    When I click on the "<collection>" collection using smart navigation
    Then I should see "<collection>" devices listed

    Examples:
      | collection     |
      | iPhones        |
      | Samsung Phones |
      | Google Pixel   |
      | PlayStation    |
      | Nintendo       |
      | Apple Watch    |
      | Xboxs          |
      