Feature: Navigation & Search Functionality

  Background:
    Given I am on the PriceFirst home page

  @NAV-01
  Scenario: Navbar renders all category links
    Then I should see the main navigation bar
    And I should see "Mobile Phone" in the navbar
    And I should see "iPad" in the navbar
    And I should see "Apple Watch" in the navbar
    And I should see "Playstation" in the navbar
    And I should see "Nintendo" in the navbar

  @NAV-04
  Scenario: Search shows no results for invalid query
    When I type "xxxxxzzz999" in the search bar
    Then the search dropdown should show no results message
 
  @NAV-05
  Scenario: Search dropdown closes on outside click
    When I type "iphone" in the search bar
    Then the search dropdown should appear
    When I click on the page body
    Then the search dropdown should not be visible

 @NAV-08
Scenario: Logo click returns to homepage
  When I type "iPhone" in the search bar
  And I click on the first suggestion
  And I click the PriceFirst logo
  Then I should be on the home page

