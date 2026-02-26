import type { Express, Request, Response } from "express";
import type { Config } from "../types.js";
import { getPending, resolvePending } from "../services/pending.js";
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

      // Get pending request first to access messageId
      const pending = getPending(requestId);

      // Update card via PATCH API
      if (pending?.messageId) {
        try {
          await updateCardMessage(config, pending.messageId, action, pending.command);
        } catch (error) {
          console.error(`[card-callback] Failed to update card:`, error);
        }
      }

      // Resolve pending request
      const resolved = resolvePending(requestId, action);
      if (!resolved) {
        // Already resolved by another callback, just return success
        res.json({});
        return;
      }

      // Return updated card in response
      const isApproved = action === "approve";
      res.json({
        toast: {
          type: "success",
          content: isApproved ? "✅ 已批准" : "❌ 已拒绝",
        },
        card: {
          type: "raw",
          data: {
            config: { wide_screen_mode: true },
            header: {
              title: { tag: "plain_text", content: isApproved ? "✅ 已批准" : "❌ 已拒绝" },
              template: isApproved ? "green" : "red",
            },
            elements: [
              {
                tag: "div",
                fields: [
                  { tag: "lark_md", content: `**命令:** ${pending?.command || "未知"}` },
                  { tag: "lark_md", content: `**处理时间:** ${new Date().toLocaleString("zh-CN")}` },
                ],
              },
            ],
          },
        },
      });
      return;
    }

    res.json({});
  });
}
