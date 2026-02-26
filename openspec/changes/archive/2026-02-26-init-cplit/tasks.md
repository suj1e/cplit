## 1. Project Setup

- [x] 1.1 Initialize package.json with TypeScript, Express, pnpm
- [x] 1.2 Configure tsconfig.json
- [x] 1.3 Configure biome.json for linting and formatting
- [x] 1.4 Create cplit.config.yaml template
- [x] 1.5 Add npm scripts (dev, build, start, lint)

## 2. Core Types & Config

- [x] 2.1 Create types.ts with Config, ApprovalRequest, ApprovalResponse interfaces
- [x] 2.2 Implement config.ts to load and validate cplit.config.yaml

## 3. Pending Map Service

- [x] 3.1 Implement pending.ts with Map-based request storage
- [x] 3.2 Add requestId generation (4-digit random number)
- [x] 3.3 Add timeout handling with auto-allow

## 4. Feishu Integration

- [x] 4.1 Implement tenant_access_token fetching with caching
- [x] 4.2 Implement approval card message sending
- [x] 4.3 Implement timeout notification card sending
- [x] 4.4 Implement webhook event parsing (approve/deny + requestId)
- [x] 4.5 Handle challenge verification for feishu setup

## 5. HTTP Routes

- [x] 5.1 Implement /request-approval route (blocking wait for decision)
- [x] 5.2 Implement /feishu/webhook route (parse and resolve pending requests)

## 6. Entry Point

- [x] 6.1 Create index.ts to bootstrap Express server
- [x] 6.2 Wire up routes and middleware

## 7. Docker

- [x] 7.1 Create Dockerfile (node:20-alpine, pnpm, dist)
- [x] 7.2 Create docker-compose.yml

## 8. Cleanup

- [x] 8.1 Delete Design.md
- [x] 8.2 Update README.md with project description and usage
