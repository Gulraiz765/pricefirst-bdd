Feature: TC-06 Error Handling - 404 Page
  As a user
  If I land on a broken URL
  I should see a helpful error page

  Background:
    Given I am on the PriceFirst website

  @404-page
  Scenario: Accessing a non-existent page shows 404
    When I navigate to a broken URL "/this-page-does-not-exist-xyz"
    Then I should see a "404" or "Page Not Found" message
    And I should see a "Return to Home" button
    And the page title should indicate an error

  @404-return-home
  Scenario: Return home button works from 404 page
    When I navigate to a broken URL "/this-page-does-not-exist-xyz"
    And I click the 404 page "Return to Home" button
    Then I should be redirected to the home page
    And the URL should be "https://staging.pricefirst.com"