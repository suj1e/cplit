import type { Express, Request, Response } from "express";
import type { Config } from "../types.js";
import { resolvePending } from "../services/pending.js";
import { parseCardCallback, updateCardMessage } from "../services/feishu.js";

export function registerCardCallbackRoutes(app: Express, config: Config): void {
  /**
   * POST /feishu/card-callback
   * Receives Feishu card button clicks
   */
  app.post("/feishu/card-callback", async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;

    // Handle challenge verification
    if (body.type === "url_verification" && typeof body.challenge === "string") {
      res.json({ challenge: body.challenge });
      return;
    }

    // Parse card callback
    const parsed = parseCardCallback(body);
    if (parsed) {
      const { action, requestId } = parsed;
      const resolved = resolvePending(requestId, action);

      if (resolved) {
        // Try to update the card to show result
        const context = body.context as Record<string, unknown> | undefined;
        const openMessageId = (body.open_message_id ?? context?.open_message_id) as string | undefined;
        const command = (body.command ?? context?.command) as string | undefined;

        if (openMessageId && command) {
          try {
            await updateCardMessage(config, openMessageId, action, command);
          } catch (error) {
            console.error("Failed to update card:", error);
          }
        }
      } else {
        console.log(`No pending request found for ID: ${requestId}`);
      }
    }

    res.status(200).send("ok");
  });
}
