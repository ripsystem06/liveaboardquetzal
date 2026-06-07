# Delta for guest-count-selector

## ADDED Requirements

### Requirement: Passenger Count Picker

The system MUST provide a numeric selector for guest count with a valid range of 1 to 18 passengers. The selector MUST allow increment and decrement by 1. The system MUST NOT allow values outside the 1–18 range. The selector MUST default to 1 passenger.

#### Scenario: Default value is one passenger

- GIVEN the guest selector is rendered
- THEN the default value MUST be 1

#### Scenario: Increment increases count

- GIVEN the current count is less than 18
- WHEN the user clicks the increment button
- THEN the count MUST increase by 1

#### Scenario: Decrement decreases count

- GIVEN the current count is greater than 1
- WHEN the user clicks the decrement button
- THEN the count MUST decrease by 1

#### Scenario: Maximum limit enforced

- GIVEN the current count is 18
- WHEN the user clicks the increment button
- THEN the count MUST remain 18 and the increment control should be visually disabled

#### Scenario: Minimum limit enforced

- GIVEN the current count is 1
- WHEN the user clicks the decrement button
- THEN the count MUST remain 1 and the decrement control should be visually disabled