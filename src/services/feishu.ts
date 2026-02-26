import type { Config, FeishuTokenResponse } from "../types.js";

// Token cache
interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry

/**
 * Get tenant_access_token with caching
 */
export async function getTenantToken(config: Config): Promise<string> {
  // Check if cached token is still valid (with buffer)
  if (tokenCache && Date.now() < tokenCache.expiresAt - TOKEN_REFRESH_BUFFER) {
    return tokenCache.token;
  }

  // Fetch new token
  const response = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: config.feishu.app_id,
      app_secret: config.feishu.app_secret,
    }),
  });

  const data = (await response.json()) as FeishuTokenResponse;

  if (!response.ok || !data.tenant_access_token) {
    throw new Error(`Failed to get tenant_access_token: ${JSON.stringify(data)}`);
  }

  // Cache the token (expire is in seconds)
  tokenCache = {
    token: data.tenant_access_token,
    expiresAt: Date.now() + data.expire * 1000,
  };

  return data.tenant_access_token;
}

/**
 * Send approval request card with interactive buttons
 */
export async function sendApprovalCard(
  config: Config,
  requestId: string,
  command: string,
  cwd: string
): Promise<string | null> {
  const token = await getTenantToken(config);

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: "plain_text", content: "🔐 Claude 命令审批请求" },
      template: "blue",
    },
    elements: [
      {
        tag: "div",
        fields: [
          { tag: "lark_md", content: `**命令:**\n\`${command}\`` },
          { tag: "lark_md", content: `**目录:**\n\`${cwd}\`` },
          { tag: "lark_md", content: `**请求ID:** ${requestId}` },
        ],
      },
      {
        tag: "action",
        actions: [
          {
            tag: "button",
            text: { tag: "plain_text", content: "✓ 批准" },
            type: "primary",
            value: { action: "approve", requestId },
          },
          {
            tag: "button",
            text: { tag: "plain_text", content: "✗ 拒绝" },
            type: "danger",
            value: { action: "deny", requestId },
          },
        ],
      },
      {
        tag: "note",
        elements: [
          {
            tag: "plain_text",
            content: `或回复 approve ${requestId} / deny ${requestId}`,
          },
        ],
      },
    ],
  };

  const response = await fetch("https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=user_id", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      receive_id: config.feishu.approver_id,
      msg_type: "interactive",
      content: JSON.stringify(card),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Failed to send approval card: ${error}`);
    return null;
  }

  const data = await response.json() as { data?: { message_id?: string } };
  return data.data?.message_id ?? null;
}

/**
 * Update card message to show result
 */
export async function updateCardMessage(
  config: Config,
  messageId: string,
  action: "approve" | "deny",
  command: string
): Promise<void> {
  const token = await getTenantToken(config);

  const isApproved = action === "approve";
  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: "plain_text", content: isApproved ? "✅ 已批准" : "❌ 已拒绝" },
      template: isApproved ? "green" : "red",
    },
    elements: [
      {
        tag: "div",
        fields: [
          { tag: "lark_md", content: `**命令:**\n\`${command}\`` },
          { tag: "lark_md", content: `**处理时间:** ${new Date().toLocaleString("zh-CN")}` },
        ],
      },
    ],
  };

  await fetch(`https://open.feishu.cn/open-apis/im/v1/messages/${messageId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      msg_type: "interactive",
      content: JSON.stringify(card),
    }),
  });
}

/**
 * Send timeout notification card
 */
export async function sendTimeoutNotification(
  config: Config,
  command: string
): Promise<void> {
  const token = await getTenantToken(config);

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: "plain_text", content: "⏰ 审批超时已自动通过" },
      template: "orange",
    },
    elements: [
      {
        tag: "div",
        fields: [{ tag: "lark_md", content: `**命令:**\n\`${command}\`` }],
      },
      {
        tag: "note",
        elements: [{ tag: "plain_text", content: "已自动执行" }],
      },
    ],
  };

  await fetch("https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=user_id", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      receive_id: config.feishu.approver_id,
      msg_type: "interactive",
      content: JSON.stringify(card),
    }),
  });
}

/**
 * Parse approval command from message text
 */
export function parseApprovalCommand(
  text: string
): { action: "approve" | "deny"; requestId: string } | null {
  const match = text.trim().toLowerCase().match(/^(approve|deny)\s+(\d{4})$/);
  if (match) {
    return {
      action: match[1] as "approve" | "deny",
      requestId: match[2],
    };
  }
  return null;
}

/**
 * Parse card button callback
 */
export function parseCardCallback(
  body: Record<string, unknown>
): { action: "approve" | "deny"; requestId: string } | null {
  try {
    const action = body.action as Record<string, unknown> | undefined;
    if (!action) return null;

    const value = action.value as Record<string, string> | undefined;
    if (!value) return null;

    if (value.action === "approve" || value.action === "deny") {
      return {
        action: value.action,
        requestId: value.requestId,
      };
    }
    return null;
  } catch {
    return null;
  }
}
