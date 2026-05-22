@condition-pricing
Feature: TC-03 Offer Calculation by Device Condition and Storage

  As a user
  I want to see different prices for different device conditions and storage
  So that I can get accurate quotes and verify top recycler prices

  Background:
    Given I am on the PriceFirst home page
    And I have searched and selected "iPhone 13"

  Scenario: Excellent condition shows offers with prices greater than zero
    When I select condition "Excellent"
    And the prices should be greater than zero

  Scenario: Fair condition shows lower price than Excellent
    When I select condition "Excellent"
    And I note the top offer price
    When I change condition to "Fair"
    Then the top offer price should be lower than before

  Scenario: Storage change affects offer prices
    When I note the top offer price for "512GB" storage
    And I change storage to "128GB"
    Then the top offer price should be lower than before
    