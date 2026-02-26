import type { PendingRequest } from "../types.js";

// In-memory map for pending approval requests
const pendingMap = new Map<string, PendingRequest>();

/**
 * Generate a 4-digit random request ID
 */
export function generateRequestId(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Store a pending request
 */
export function storePending(request: PendingRequest): void {
  pendingMap.set(request.requestId, request);
}

/**
 * Get a pending request by ID
 */
export function getPending(requestId: string): PendingRequest | undefined {
  return pendingMap.get(requestId);
}

/**
 * Remove a pending request by ID
 */
export function removePending(requestId: string): void {
  const request = pendingMap.get(requestId);
  if (request) {
    clearTimeout(request.timeoutId);
    pendingMap.delete(requestId);
  }
}

/**
 * Resolve a pending request with a decision
 */
export function resolvePending(
  requestId: string,
  decision: "approve" | "deny"
): boolean {
  const request = pendingMap.get(requestId);
  if (request) {
    clearTimeout(request.timeoutId);
    request.resolve(decision);
    pendingMap.delete(requestId);
    return true;
  }
  return false;
}
