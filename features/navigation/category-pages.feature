Feature: Category & Collection Pages

  Background:
    Given I am on the PriceFirst home page

  @CAT-01
  Scenario: Navigate to Samsung device via navbar dropdown
    When I hover on "Mobile Phone" in the navbar
    Then I should see the mobile phone submenu
    When I hover on "Samsung Phones" in the submenu
    And I click on a random Samsung device from the category page
    Then I should be on the product page for that device

  @CAT-01-iPhone
  Scenario: iPhones category loads correct devices
    When I hover on "Mobile Phone" in the navbar
    And I hover on "Iphones" in the submenu
    And I click on a random device from the dropdown
    Then I should be on the product page for that device
    And the URL should contain keyword "iphone"

  @CAT-01-Google
  Scenario: Google Pixel category loads correct devices
    When I hover on "Mobile Phone" in the navbar
    And I hover on "Google Pixel" in the submenu
    And I click on a random device from the dropdown
    Then I should be on the product page for that device
    And the URL should contain keyword "google"

  @CAT-01-iPad
  Scenario: iPad category loads correct devices
    When I hover on "iPad" in the navbar
    And I click on a random device from the dropdown
    Then I should be on the product page for that device
    And the URL should contain keyword "ipad"

  @CAT-01-AppleWatch
  Scenario: Apple Watch category loads correct devices
    When I hover on "Apple Watch" in the navbar
    And I click on a random device from the dropdown
    Then I should be on the product page for that device
    And the URL should contain keyword "apple"

  @CAT-01-Playstation
  Scenario: Playstation category loads correct devices
    When I hover on "Playstation" in the navbar
    And I click on a random device from the dropdown
    Then I should be on the product page for that device
    And the URL should contain keyword "playstation"

  @CAT-01-Nintendo
  Scenario: Nintendo category loads correct devices
    When I hover on "Nintendo" in the navbar
    And I click on a random device from the dropdown
    Then I should be on the product page for that device
    And the URL should contain keyword "nintendo"

  @CAT-02
  Scenario Outline: Sell by Category cards link to correct pages
    When I click on the "<cardName>" card in Sell by Category section
    Then I should be on the correct category page
    And the URL should contain "<urlKeyword>"
    When I go back to home page

    Examples:
      | cardName        | urlKeyword       |
      | Xboxs           | xbox             |
      | Gaming Console  | gaming-console   |
      | Samsung Phones  | samsung          |
      | iPhones         | iphone           |
      | Google Pixel    | google           |
      | Mobile Phones   | mobile-phones    |

           @CAT-Pagination-Complete
  Scenario: Complete pagination testing on Mobile Phones category
    When I navigate to "Mobile Phones" category page
    Then I should see pagination controls
    And I test page 1 vs page 2 products are different

             @CAT-Complete-Flow
Scenario: Complete collection and pagination testing for all categories
  Given I am on the PriceFirst home page
  When I scroll to the "Sell by Category" section
  And I click "View All" in the Sell by Category section
  Then I should be on the collections page
  Then I should see all device categories
  When I test all categories with pagination