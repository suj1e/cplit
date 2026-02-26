# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cplit is a remote approval service for Claude CLI hooks. When Claude CLI encounters a non-whitelisted command, it sends a request to Cplit, which forwards an approval card to Feishu (飞书). The user responds via mobile, and Cplit returns the decision to the CLI.

## Commands

```bash
pnpm install      # Install dependencies
pnpm dev          # Development with hot reload
pnpm build        # Compile TypeScript to dist/
pnpm start        # Run production build
pnpm lint         # Check code with Biome
pnpm lint:fix     # Auto-fix lint issues
```

## Architecture

```
src/
├── index.ts           # Express server entry point
├── config.ts          # Loads config from YAML + env vars (env takes priority)
├── types.ts           # TypeScript interfaces
├── routes/
│   ├── approval.ts    # POST /request-approval - blocking endpoint for hooks
│   └── webhook.ts     # POST /feishu/webhook - receives Feishu callbacks
└── services/
    ├── pending.ts     # In-memory Map for pending requests, requestId generation
    └── feishu.ts      # Feishu API: token caching, card messages, webhook parsing
```

**Data Flow:**
1. `/request-approval` creates a PendingRequest with a 4-digit requestId
2. Request stored in pendingMap, Feishu card sent
3. Endpoint blocks until webhook resolves or timeout (60s → auto-allow)
4. `/feishu/webhook` parses "approve/deny {id}" and resolves pending promise

**Key Design Decisions:**
- In-memory storage (no persistence, restarts lose pending requests)
- 4-digit requestId for easy mobile input
- Timeout defaults to auto-allow (not deny) to avoid blocking workflows
- Feishu tenant_access_token cached with 5min refresh buffer

## Configuration

Config loaded from `cplit.config.yaml` + environment variables. **Env vars take priority.**

**Required:**
- `FEISHU_APP_ID` / `feishu.app_id`
- `FEISHU_APP_SECRET` / `feishu.app_secret`
- `FEISHU_APPROVER_ID` / `feishu.approver_id`

**Optional:**
- `SERVER_PORT` / `server.port` (default: 3000)
- `APPROVAL_TIMEOUT` / `approval.timeout` (default: 60000ms)

## Deployment

Docker Compose with Nginx reverse proxy for HTTPS:

```
nginx/ssl/
├── dmall.ink.pem   # SSL certificate
└── dmall.ink.key   # SSL private key
```

```bash
docker-compose up -d
```

Feishu webhook URL: `https://dmall.ink/feishu/webhook`
