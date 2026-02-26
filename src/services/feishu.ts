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
 * Send approval request card message
 */
export async function sendApprovalCard(
  config: Config,
  requestId: string,
  command: string,
  cwd: string
): Promise<void> {
  const token = await getTenantToken(config);

  const cardContent = {
    type: "template",
    data: {
      template_id: "AAqkzJ8v", // Simple card template
      template_variable: {
        title: "🔐 Claude 命令审批请求",
        command: command,
        cwd: cwd,
        request_id: requestId,
      },
    },
  };

  // Fallback to interactive card if template not available
  const interactiveCard = {
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
        tag: "note",
        elements: [
          {
            tag: "plain_text",
            content: `💬 回复 approve ${requestId} 或 deny ${requestId}`,
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
      content: JSON.stringify(interactiveCard),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Failed to send approval card: ${error}`);
  }
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
 * Returns { action: 'approve' | 'deny', requestId: string } or null
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
