## Context

Cplit 是一个轻量级的审批代理服务，部署在本地或服务器上，通过飞书 Bot 实现远程命令审批。

**核心约束：**
- 个人使用，不涉及多租户、权限系统
- 通过 HTTP 与 Claude CLI Hook 解耦交互
- 内存存储，服务重启会丢失 pending 请求

## Goals / Non-Goals

**Goals:**
- 实现最小可用的审批流程：请求 → 飞书消息 → 回复 → 返回决策
- 支持飞书卡片消息格式
- 超时自动通过 + 通知
- Docker 部署支持

**Non-Goals:**
- 多审批人、多渠道扩展
- 持久化存储
- 复杂的权限验证
- 自动审批规则

## Decisions

### 技术栈：TypeScript + Express + pnpm

**理由：** TypeScript 提供类型安全，Express 轻量够用，pnpm 快且节省磁盘。

**备选：** Fastify（更快但生态稍小）、Hono（更现代但本项目不需要 edge 支持）

### 代码风格：Biome + tsc

**理由：** Biome 比 ESLint + Prettier 快 10-100 倍，配置简单。tsc 直接编译，不需要打包。

**备选：** ESLint + Prettier（更成熟但慢）、tsup（打包单文件，但本项目不需要）

### 存储：内存 Map

**理由：** MVP 够用，重启丢失可接受（用户重新发请求即可）。

**备选：** Redis（过度设计）

### 超时策略：60s → allow + 通知

**理由：** 宁可多执行也不要卡死工作流，通知让用户知道发生了什么。

**备选：** deny（可能阻塞重要操作）

### requestId：4位随机数字

**理由：** 手机输入方便，4位足够（1万种组合，短时间碰撞概率低）。

**备选：** UUID（太长，手机输入困难）

### tenant_token 缓存：提前 5 分钟刷新

**理由：** 飞书 token 2小时有效，提前刷新避免边界问题。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 飞书 API 不可用 | 返回 allow，记录错误（console.log） |
| requestId 碰撞 | 极低概率，碰撞时两个请求都会被 resolve |
| 服务重启丢失 pending | 可接受，用户重新触发 hook |
| 4位 requestId 被猜测 | 个人使用，安全风险低 |

## 项目结构

```
cplit/
├── src/
│   ├── index.ts           # 入口，启动服务
│   ├── routes/
│   │   ├── approval.ts    # POST /request-approval
│   │   └── webhook.ts     # POST /feishu/webhook
│   ├── services/
│   │   ├── feishu.ts      # 飞书 API + token 缓存
│   │   └── pending.ts     # pendingMap 管理
│   ├── config.ts          # 加载 cplit.config.yaml
│   └── types.ts           # 类型定义
├── cplit.config.yaml
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── biome.json
```
