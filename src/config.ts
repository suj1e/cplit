import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { Config } from "./types.js";

const DEFAULT_PORT = 3000;
const DEFAULT_TIMEOUT = 60000;

// Environment variable names
const ENV = {
  SERVER_PORT: "SERVER_PORT",
  FEISHU_APP_ID: "FEISHU_APP_ID",
  FEISHU_APP_SECRET: "FEISHU_APP_SECRET",
  FEISHU_APPROVER_ID: "FEISHU_APPROVER_ID",
  APPROVAL_TIMEOUT: "APPROVAL_TIMEOUT",
} as const;

// Helper to get env var with fallback
function getEnv(key: string, fallback?: string): string | undefined {
  return process.env[key] ?? fallback;
}

// Helper to get number env var
function getEnvNumber(key: string, fallback: number): number {
  const value = process.env[key];
  if (value) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

export function loadConfig(): Config {
  const configPath = join(process.cwd(), "cplit.config.yaml");

  // Load config file if exists
  let rawConfig: Record<string, unknown> = {};
  if (existsSync(configPath)) {
    try {
      const content = readFileSync(configPath, "utf-8");
      rawConfig = parse(content);
    } catch (error) {
      throw new Error(`Failed to load config file: ${configPath}\n${error}`);
    }
  }

  const server = rawConfig.server as Record<string, unknown> | undefined;
  const feishu = rawConfig.feishu as Record<string, unknown> | undefined;
  const approval = rawConfig.approval as Record<string, unknown> | undefined;

  // Build config with priority: env > config file > default
  const config: Config = {
    server: {
      port: getEnvNumber(ENV.SERVER_PORT, (server?.port as number) ?? DEFAULT_PORT),
    },
    feishu: {
      app_id: getEnv(ENV.FEISHU_APP_ID, feishu?.app_id as string) ?? "",
      app_secret: getEnv(ENV.FEISHU_APP_SECRET, feishu?.app_secret as string) ?? "",
      approver_id:
        getEnv(ENV.FEISHU_APPROVER_ID, feishu?.approver_id as string) ?? "",
    },
    approval: {
      timeout: getEnvNumber(
        ENV.APPROVAL_TIMEOUT,
        (approval?.timeout as number) ?? DEFAULT_TIMEOUT
      ),
    },
  };

  // Validate required fields
  if (!config.feishu.app_id) {
    throw new Error("Missing required config: feishu.app_id (set FEISHU_APP_ID or add to config file)");
  }
  if (!config.feishu.app_secret) {
    throw new Error("Missing required config: feishu.app_secret (set FEISHU_APP_SECRET or add to config file)");
  }
  if (!config.feishu.approver_id) {
    throw new Error("Missing required config: feishu.approver_id (set FEISHU_APPROVER_ID or add to config file)");
  }

  return config;
}
