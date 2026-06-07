# Delta for payment-mockup

## ADDED Requirements

### Requirement: Decorative Payment Buttons

The system MUST display three payment method options: Credit Card (Stripe), PayPal, and Bank Transfer. Each option MUST be rendered as a button. Clicking any button MUST display a mock confirmation message — no actual payment processing, no network requests, no token generation. The payment section MUST show the selected cruise summary and total price including guest count.

#### Scenario: Display payment options

- GIVEN the user is on the payment step
- THEN three payment buttons MUST be displayed: Credit Card, PayPal, Bank Transfer

#### Scenario: Clicking Credit Card shows confirmation

- GIVEN the user is on the payment step
- WHEN the user clicks the Credit Card button
- THEN a mock confirmation message MUST be displayed: "Payment initiated for [cruise name] — [n] guests — $[total] USD"

#### Scenario: Clicking PayPal shows confirmation

- GIVEN the user is on the payment step
- WHEN the user clicks the PayPal button
- THEN a mock confirmation message MUST be displayed with the same format

#### Scenario: Clicking Bank Transfer shows confirmation

- GIVEN the user is on the payment step
- WHEN the user clicks the Bank Transfer button
- THEN a mock confirmation message MUST be displayed with the same format

#### Scenario: Payment section shows booking summary

- GIVEN the user is on the payment step
- THEN the section MUST display: cruise name, guest count, and total price calculated as (price per person × guest count)

#### Scenario: No payment processing occurs

- GIVEN the user clicks any payment button
- THEN no network requests MUST be made and no payment tokens or session data MUST be created