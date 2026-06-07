# Delta: mock-auth

## MODIFIED Requirements

### Requirement: Hardcoded Credential Validation

The system MUST validate email and password against the hardcoded pair `demo@quetzal.com` / `123456`. The validation MUST be case-sensitive for the password. The system MUST NOT issue any session token, JWT, cookie, or any persistent authentication artifact. Authentication state MUST be held in React component state and persisted via UserContext to localStorage.

(Previously: credential pair was `user123` / `123456`)

#### Scenario: Valid credentials accepted

- GIVEN the user enters email "demo@quetzal.com" and password "123456"
- WHEN the form is submitted
- THEN the system MUST return authentication success and allow the user to proceed to the next step

#### Scenario: Invalid password rejected

- GIVEN the user enters email "demo@quetzal.com" and password "wrong"
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

#### Scenario: Old credential rejected

- GIVEN the user enters email "user123" and password "123456"
- WHEN the form is submitted
- THEN the system MUST display an error message: "Invalid email or password"