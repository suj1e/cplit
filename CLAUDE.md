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
│   ├── webhook.ts     # POST /feishu/webhook - receives Feishu text callbacks
│   └── card-callback.ts # POST /feishu/card-callback - receives button clicks
└── services/
    ├── pending.ts     # In-memory Map for pending requests, requestId generation
    └── feishu.ts      # Feishu API: token caching, card messages, card updates
```

**Data Flow:**
1. `/request-approval` creates a PendingRequest with a 4-digit requestId
2. Request stored in pendingMap (includes messageId), Feishu card sent
3. Endpoint blocks until callback resolves or timeout (60s → auto-allow)
4. `/feishu/card-callback` handles button clicks:
   - Gets pending request to access messageId
   - Updates card via PATCH API + response body
   - Resolves pending promise
5. Timeout triggers auto-approve with card update to "超时自动批准"

**Key Design Decisions:**
- In-memory storage (no persistence, restarts lose pending requests)
- 4-digit requestId for easy mobile input
- Timeout defaults to auto-allow (not deny) to avoid blocking workflows
- Feishu tenant_access_token cached with 5min refresh buffer
- Card updates use both PATCH API (persistence) + response body (immediate UI update)

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

cplit is deployed behind the npass gateway. The gateway handles SSL termination and routes `cplit.dmall.ink` to this service.

```bash
# Build and start (joins npass network)
pnpm build
docker-compose up -d
```

**Prerequisites:**
- npass gateway must be running
- Docker network `npass` must exist
- SSL certificate managed by npass

Feishu webhook URL: `https://cplit.dmall.ink/feishu/webhook`
Feishu card callback URL: `https://cplit.dmall.ink/feishu/card-callback`
