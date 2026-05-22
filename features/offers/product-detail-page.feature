Feature: Product Detail Page

  Background:
    Given I am on the PriceFirst home page
    When I search for "Samsung Galaxy S23" in the search bar
    And I click on the first suggestion

  @PDP-01
  Scenario: Storage variants update offer price
    When I select "512GB" storage option
    Then the offer price should update

  @PDP-02
  Scenario: Network variant changes offer
    When I select "Three" network option
    Then the offer price should update

  @PDP-03
  Scenario: All condition variants are selectable
    When I select "Excellent" condition
    Then the condition should be selected
    When I select "Very Good" condition
    Then the condition should be selected
    When I select "Good" condition
    Then the condition should be selected
    When I select "Fair" condition
    Then the condition should be selected

  @PDP-05
  Scenario: Offers section shows buyer details
    Then I should see multiple offers displayed
    And each offer should show a price
    And each offer should have a "Sell Now" button

  @PDP-07
  Scenario: Highest price offer badge is visible
    Then I should see a "Highest Price Offer" badge
    And it should appear on only one offer
    