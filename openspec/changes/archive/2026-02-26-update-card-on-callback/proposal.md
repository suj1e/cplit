## Why

When users click approve/deny buttons on Feishu approval cards, the toast notification works but the card itself doesn't update. This allows repeated clicks and provides no visual confirmation of the final state on the card itself.

## What Changes

- Store `messageId` when sending approval cards to Feishu
- Use Feishu PATCH API to update card content when callback is received
- Replace interactive buttons with status display (approved/denied) after user action
- Prevent duplicate button clicks by updating card UI immediately

## Capabilities

### New Capabilities

- `card-state-update`: Capability to update approval card visual state after user interaction

### Modified Capabilities

None - this is an enhancement to existing approval flow, not a requirement change.

## Impact

- `src/types.ts` - Add `messageId?: string` to `PendingRequest` interface
- `src/routes/approval.ts` - Capture and store `messageId` from `sendApprovalCard()`
- `src/routes/card-callback.ts` - Call `updateCardMessage()` before resolving pending request
- `src/services/pending.ts` - Ensure `getPending()` is exported for callback use
