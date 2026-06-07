# Delta for mock-auth

## ADDED Requirements

### Requirement: Hardcoded Credential Validation

The system MUST validate email and password against the hardcoded pair `user123` / `123456`. The validation MUST be case-sensitive for the password. The system MUST NOT issue any session token, JWT, cookie, or any persistent authentication artifact. Authentication state MUST be held in React component state only.

#### Scenario: Valid credentials accepted

- GIVEN the user enters email "user123" and password "123456"
- WHEN the form is submitted
- THEN the system MUST return authentication success and allow the user to proceed to the next step

#### Scenario: Invalid password rejected

- GIVEN the user enters email "user123" and password "wrong"
- WHEN the form is submitted
- THEN the system MUST display an error message: "Invalid email or password"

#### Scenario: Invalid email rejected

- GIVEN the user enters email "other" and password "123456"
- WHEN the form is submitted
- THEN the system MUST display an error message: "Invalid email or password"

#### Scenario: Empty fields rejected

- GIVEN the user leaves email or password empty
- WHEN the form is submitted
- THEN the system MUST display a validation error before attempting authentication

#### Scenario: No session token issued

- GIVEN the user has successfully authenticated
- THEN the system MUST NOT create any cookie, localStorage entry, or external token