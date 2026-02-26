## ADDED Requirements

### Requirement: Card visual state updates after user interaction

When a user clicks approve or deny on an approval card, the system SHALL update the card's visual content to reflect the decision and remove interactive elements.

#### Scenario: User approves request
- **WHEN** user clicks the approve button on an approval card
- **THEN** the card SHALL be updated to show "✅ 已批准" status
- **AND** the approve and deny buttons SHALL be removed
- **AND** the card SHALL display the request ID and processing time

#### Scenario: User denies request
- **WHEN** user clicks the deny button on an approval card
- **THEN** the card SHALL be updated to show "❌ 已拒绝" status
- **AND** the approve and deny buttons SHALL be removed
- **AND** the card SHALL display the request ID and processing time

### Requirement: MessageId stored for card updates

The system SHALL store the Feishu message ID when sending approval cards to enable subsequent card updates.

#### Scenario: MessageId captured on card send
- **WHEN** an approval card is sent to Feishu
- **THEN** the returned message ID SHALL be stored with the pending request

### Requirement: Card update uses PATCH API

The system SHALL use Feishu's PATCH API to update card content after receiving a callback.

#### Scenario: PATCH API called on callback
- **WHEN** a card callback is received with approve or deny action
- **THEN** the system SHALL call the PATCH API with the stored message ID
- **AND** the updated card content SHALL replace the original card

#### Scenario: PATCH API failure handled gracefully
- **WHEN** the PATCH API call fails
- **THEN** the system SHALL log the error
- **AND** the approval decision SHALL still be processed
- **AND** a toast notification SHALL still be shown to the user
