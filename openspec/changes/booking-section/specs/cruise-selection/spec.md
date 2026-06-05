# Delta for cruise-selection

## ADDED Requirements

### Requirement: Display Mock Cruise Data

The system MUST display a list of at least 3 mock cruises. Each cruise card MUST show: cruise name, departure date, route description, and price per person in USD. The cruise data MUST be hardcoded in the client component — no API calls, no fetch, no server-side data loading.

#### Scenario: Display cruise list

- GIVEN the user is on the cruise selection step
- THEN the system MUST display at least 3 cruise options as cards

#### Scenario: Cruise card content

- GIVEN a cruise card is displayed
- THEN it MUST show cruise name, date, route, and price per person

#### Scenario: Select a cruise

- GIVEN the user is viewing cruise cards
- WHEN the user clicks the "Select" button on a cruise card
- THEN the selected cruise MUST be stored in component state and the user can advance to the next step

#### Scenario: Cruise selection required before proceeding

- GIVEN the user has not selected a cruise
- WHEN the user attempts to advance to the payment step
- THEN the system MUST show a prompt to select a cruise before advancing

#### Scenario: No external data fetching

- GIVEN the cruise selection component is rendered
- THEN it MUST NOT make any network requests to fetch cruise data