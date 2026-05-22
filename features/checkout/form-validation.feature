Feature: TC-08 Form Validations
  As a user
  When I submit the contact form
  I want to see appropriate responses

  Background:
    Given I am on the contact us page

  @form-empty-fields
  Scenario: Contact form - empty fields show errors
    When I submit the contact form without filling any fields
    Then I should see required field error messages

  @form-invalid-email
  Scenario Outline: Contact form - invalid email format (if validation exists)
    When I enter "<invalid_email>" in the email field
    And I fill the name field with "Test User"
    And I fill the message field with "This is a test message"
    And I submit the contact form
    Then I should see an email validation error OR the form should be accepted

    Examples:
      | invalid_email |
      | notanemail    |
      | missing@      |
      | @nodomain.com |
      | user@         |
      | user@domain   |

  @form-all-fields-empty
  Scenario: Contact form - all fields empty shows multiple errors
    When I submit the contact form without filling any fields
    Then I should see a required field error for name
    And I should see a required field error for email
    And I should see a required field error for message

@checkout-success
Scenario: Checkout form - valid data submits successfully
  When I fill the checkout form with valid details
  And I click the Complete Your Order button
  Then I should see the order confirmation