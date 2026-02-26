// Config types
export interface Config {
  server: ServerConfig;
  feishu: FeishuConfig;
  approval: ApprovalConfig;
}

export interface ServerConfig {
  port: number;
}

export interface FeishuConfig {
  app_id: string;
  app_secret: string;
  approver_id: string;
}

export interface ApprovalConfig {
  timeout: number;
}

// API types
export interface ApprovalRequest {
  command: string;
  cwd: string;
}

export interface ApprovalResponse {
  decision: "approve" | "deny";
}

// Pending request
export interface PendingRequest {
  requestId: string;
  command: string;
  cwd: string;
  resolve: (decision: "approve" | "deny") => void;
  timeoutId: NodeJS.Timeout;
}

// Feishu types
export interface FeishuWebhookEvent {
  type: string;
  challenge?: string;
  event?: {
    type: string;
    message?: {
      content: string;
      message_id: string;
    };
    sender?: {
      sender_id?: {
        user_id?: string;
        open_id?: string;
      };
    };
  };
}

export interface FeishuTokenResponse {
  tenant_access_token: string;
  expire: number;
}

export interface FeishuMessageResponse {
  code: number;
  msg: string;
  data?: {
    message_id: string;
  };
}
