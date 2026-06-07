# Delta for booking-flow

## ADDED Requirements

### Requirement: 3-Step Flow Orchestration

The system MUST display a 3-step booking flow with steps labeled "Login", "Select Cruise", and "Payment". The flow coordinator MUST show a step indicator and render only the current step's content. Navigation between steps MUST be linear: step 1 → step 2 → step 3. Back navigation from step 2 to step 1 MUST be supported. Step 3 MUST NOT be accessible until steps 1 and 2 are completed.

#### Scenario: Complete login and advance to cruise selection

- GIVEN the user is on step 1 "Login"
- WHEN the user enters valid mock credentials (user123 / 123456) and submits
- THEN the flow MUST advance to step 2 "Select Cruise"

#### Scenario: Invalid credentials prevent advancement

- GIVEN the user is on step 1 "Login"
- WHEN the user enters invalid credentials and submits
- THEN the flow MUST display an error message and MUST NOT advance to step 2

#### Scenario: Back navigation from cruise selection

- GIVEN the user is on step 2 "Select Cruise"
- WHEN the user clicks the back button
- THEN the flow MUST return to step 1 "Login" with previously entered credentials preserved

#### Scenario: Advance from cruise selection to payment

- GIVEN the user is on step 2 "Select Cruise"
- WHEN the user selects a cruise and guest count
- THEN the user MUST be able to advance to step 3 "Payment"

#### Scenario: Step indicator reflects current position

- GIVEN the user is on step 2 of the flow
- THEN the step indicator MUST show step 1 as completed, step 2 as active, and step 3 as pending