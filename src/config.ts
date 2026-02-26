import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { Config } from "./types.js";

const DEFAULT_PORT = 3000;
const DEFAULT_TIMEOUT = 60000;

export function loadConfig(): Config {
  const configPath = join(process.cwd(), "cplit.config.yaml");

  let rawConfig: Record<string, unknown>;
  try {
    const content = readFileSync(configPath, "utf-8");
    rawConfig = parse(content);
  } catch (error) {
    throw new Error(`Failed to load config file: ${configPath}\n${error}`);
  }

  // Validate required fields
  const feishu = rawConfig.feishu as Record<string, unknown> | undefined;
  if (!feishu?.app_id) {
    throw new Error("Missing required config: feishu.app_id");
  }
  if (!feishu?.app_secret) {
    throw new Error("Missing required config: feishu.app_secret");
  }
  if (!feishu?.approver_id) {
    throw new Error("Missing required config: feishu.approver_id");
  }

  const config: Config = {
    server: {
      port: (rawConfig.server as Record<string, unknown>)?.port ?? DEFAULT_PORT,
    },
    feishu: {
      app_id: feishu.app_id as string,
      app_secret: feishu.app_secret as string,
      approver_id: feishu.approver_id as string,
    },
    approval: {
      timeout:
        (rawConfig.approval as Record<string, unknown>)?.timeout ?? DEFAULT_TIMEOUT,
    },
  };

  return config;
}
