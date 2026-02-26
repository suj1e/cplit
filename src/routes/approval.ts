import type { Express, Request, Response } from "express";
import type { Config } from "../types.js";
import {
  generateRequestId,
  storePending,
  resolvePending,
} from "../services/pending.js";
import {
  sendApprovalCard,
  sendTimeoutNotification,
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

    // Create promise that will be resolved by webhook or timeout
    const decisionPromise = new Promise<"approve" | "deny">((resolve) => {
      // Set up timeout - auto-allow after timeout
      const timeoutId = setTimeout(async () => {
        resolve("approve");
        await sendTimeoutNotification(config, command);
      }, config.approval.timeout);

      // Store pending request
      storePending({
        requestId,
        command,
        cwd: cwd || process.cwd(),
        resolve,
        timeoutId,
      });
    });

    // Send approval request to Feishu
    try {
      await sendApprovalCard(config, requestId, command, cwd || process.cwd());
    } catch (error) {
      console.error("Failed to send approval card:", error);
      // Still proceed - timeout will handle it
    }

    // Wait for decision (blocking)
    const decision = await decisionPromise;

    res.json({ decision });
  });
}
