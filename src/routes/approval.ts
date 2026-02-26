import type { Express, Request, Response } from "express";
import type { Config } from "../types.js";
import {
  generateRequestId,
  storePending,
  resolvePending,
} from "../services/pending.js";
import {
  sendApprovalCard,
  updateCardMessage,
} from "../services/feishu.js";

export function registerApprovalRoutes(app: Express, config: Config): void {
  /**
   * POST /request-approval
   * Called by Claude CLI hook to request approval
   */
  app.post("/request-approval", async (req: Request, res: Response) => {
    const { command, cwd } = req.body;

    if (!command) {
      res.status(400).json({ error: "Missing command" });
      return;
    }

    const requestId = generateRequestId();

    // Send approval card first to get messageId
    let messageId: string | undefined;
    try {
      const id = await sendApprovalCard(config, requestId, command, cwd || process.cwd());
      messageId = id ?? undefined;
    } catch (error) {
      console.error("Failed to send approval card:", error);
      // Still proceed - timeout will handle it
    }

    // Create promise that will be resolved by webhook or timeout
    const decisionPromise = new Promise<"approve" | "deny">((resolve) => {
      // Set up timeout - auto-allow after timeout
      const timeoutId = setTimeout(async () => {
        resolve("approve");
        // Update card to show timeout status
        if (messageId) {
          try {
            await updateCardMessage(config, messageId, "timeout", command);
          } catch (error) {
            console.error("Failed to update card on timeout:", error);
          }
        }
      }, config.approval.timeout);

      // Store pending request with messageId
      storePending({
        requestId,
        messageId,
        command,
        cwd: cwd || process.cwd(),
        resolve,
        timeoutId,
      });
    });

    // Wait for decision (blocking)
    const decision = await decisionPromise;

    res.json({ decision });
  });
}
