import type { Express, Request, Response } from "express";
import type { Config } from "../types.js";
import { resolvePending } from "../services/pending.js";
import { parseCardCallback } from "../services/feishu.js";

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
        console.log(`Resolved request ${requestId} with action ${action}`);
      } else {
        console.log(`No pending request found for ID: ${requestId}`);
      }

      // Return updated card to replace buttons with status
      const isApproved = action === "approve";
      const resultCard = {
        config: { wide_screen_mode: true },
        header: {
          title: { tag: "plain_text", content: isApproved ? "✅ 已批准" : "❌ 已拒绝" },
          template: isApproved ? "green" : "red",
        },
        elements: [
          {
            tag: "div",
            fields: [
              { tag: "lark_md", content: `**处理时间:** ${new Date().toLocaleString("zh-CN")}` },
            ],
          },
        ],
      };

      res.json({ card: resultCard });
      return;
    }

    res.json({});
  });
}
