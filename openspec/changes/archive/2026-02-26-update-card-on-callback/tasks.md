## 1. Type Definition

- [x] 1.1 Add `messageId?: string` to `PendingRequest` interface in `types.ts`

## 2. Approval Route

- [x] 2.1 Capture `messageId` returned from `sendApprovalCard()` in `approval.ts`
- [x] 2.2 Store `messageId` in the pending request object

## 3. Callback Handler

- [x] 3.1 Import `getPending` and `updateCardMessage` in `card-callback.ts`
- [x] 3.2 Get pending request before resolving to access `messageId`
- [x] 3.3 Call `updateCardMessage()` with approved/denied card content
- [x] 3.4 Handle PATCH API failure gracefully (log error, continue)
- [x] 3.5 Simplify response to only return toast

## 4. Timeout Handler

- [x] 4.1 Import `updateCardMessage` in `approval.ts`
- [x] 4.2 Update timeout handler to call `updateCardMessage()` with "超时自动批准" status
- [x] 4.3 Pass `config` and `messageId` to timeout closure

## 5. Testing

- [x] 5.1 Build and restart service
- [x] 5.2 Send test approval request and click approve/deny
- [x] 5.3 Verify card updates and buttons are removed
- [x] 5.4 Test timeout scenario (short timeout or wait)
