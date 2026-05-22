Feature: Homepage Sections

  Background:
    Given I am on the PriceFirst home page

  @HOM-02
  Scenario: How it works steps are visible
    Then I should see "Search Your Device" step
    And I should see "Compare Offers" step
    And I should see "Send It Free" step
    And I should see "Get Paid Fast" step

  @HOM-03
  Scenario: Category grid shows 6 categories
    Then I should see "Xboxs" in the sell by category section
    And I should see "Gaming Console" in the sell by category section
    And I should see "Samsung Phones" in the sell by category section
    And I should see "iPhones" in the sell by category section
    And I should see "Google Pixel" in the sell by category section
    And I should see "Mobile Phones" in the sell by category section

 @HOM-04
Scenario Outline: All FAQ questions expand on click
  When I click on FAQ question <question_number>
  Then the answer for FAQ question <question_number> should become visible

  Examples:
    | question_number |
    | 1               |
    | 2               |
    | 3               |
    | 4               |
    | 5               |

@HOM-05
Scenario: Only one FAQ stays open at a time
  When I click on FAQ question 1
  Then the answer for FAQ question 1 should become visible
  When I click on FAQ question 2
  Then the answer for FAQ question 2 should become visible
  Then only one FAQ answer should be visible at a time

  @HOM-06
  Scenario: Footer email subscription works
    When I enter "test@example.com" in the footer email box
    And I click the subscribe button
    Then I should see a success confirmation

  @HOM-07
  Scenario: Footer links are working
    When I click "Contact Us" in the footer
    Then I should be on the contact page
    When I go back to home page
    When I click "Privacy Policy" in the footer
    Then I should see the privacy policy page
    When I go back to home page
    When I click "Terms & Conditions" in the footer
    Then I should see the terms and conditions page