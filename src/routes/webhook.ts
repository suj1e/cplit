import type { Express, Request, Response } from "express";
import type { Config } from "../types.js";
import { resolvePending } from "../services/pending.js";
import { parseApprovalCommand } from "../services/feishu.js";

export function registerWebhookRoutes(app: Express, _config: Config): void {
  /**
   * POST /feishu/webhook
   * Receives Feishu message events
   */
  app.post("/feishu/webhook", (req: Request, res: Response) => {
    const body = req.body;

    // Handle challenge verification for initial setup
    if (body.type === "url_verification" && body.challenge) {
      res.json({ challenge: body.challenge });
      return;
    }

    // Handle message events
    if (body.type === "event_callback" && body.event?.type === "message") {
      // Parse message content
      let messageText = "";
      try {
        const content = body.event.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          messageText = parsed.text || "";
        }
      } catch {
        // Content might be plain text
        messageText = body.event.message?.content || "";
      }

      // Parse approval command
      const parsed = parseApprovalCommand(messageText);
      if (parsed) {
        const resolved = resolvePending(parsed.requestId, parsed.action);
        if (!resolved) {
          console.log(`No pending request found for ID: ${parsed.requestId}`);
        }
      }
    }

    // Always respond 200 to acknowledge receipt
    res.status(200).send("ok");
  });
}
