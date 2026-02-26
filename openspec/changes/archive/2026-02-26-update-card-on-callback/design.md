## Context

Current flow: When a user clicks approve/deny on a Feishu card, the callback handler responds with both `toast` and `card` in the response body. The toast works, but the card update is ignored by Feishu.

Feishu's card callback system requires either:
1. Response format we haven't figured out, OR
2. Separate PATCH API call to update the card

The `updateCardMessage()` function already exists in `feishu.ts` and uses `PATCH /im/v1/messages/{message_id}`. The missing piece is the `messageId` which is not stored when sending the card.

## Goals / Non-Goals

**Goals:**
- Store `messageId` when sending approval cards
- Update card visual state after user clicks approve/deny
- Prevent repeated button clicks by replacing interactive elements with status

**Non-Goals:**
- Changing the approval timeout behavior
- Modifying the toast notification system
- Adding persistence (still in-memory storage)

## Decisions

### 1. Store messageId in PendingRequest

**Decision**: Add `messageId?: string` to `PendingRequest` interface and store it when creating pending requests.

**Rationale**: The `sendApprovalCard()` function already returns `messageId`. We just need to capture it and store it alongside the pending request.

**Alternative considered**: Store in a separate Map. Rejected because it adds complexity without benefit.

### 2. Use PATCH API instead of callback response

**Decision**: Call `updateCardMessage()` via PATCH API when callback is received, instead of relying on callback response format.

**Rationale**:
- The `card` field in callback response doesn't work (unknown format issue)
- PATCH API is the documented and reliable way to update cards
- We already have `updateCardMessage()` implemented

### 3. Get pending before resolve

**Decision**: In callback handler, call `getPending()` first to retrieve `messageId`, then call PATCH API, then call `resolvePending()`.

**Rationale**: `resolvePending()` deletes the pending request. We need the `messageId` before it's deleted.

**Flow**:
```
callback received
    → getPending(requestId)  // get messageId
    → updateCardMessage()    // PATCH API
    → resolvePending()       // delete & resolve promise
    → return toast response
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| PATCH API call might fail | Still return toast, log error, approval still works |
| messageId might be undefined | Check before calling PATCH, skip update if missing |
| Race condition (double click) | Card update removes buttons, second click has no effect |
