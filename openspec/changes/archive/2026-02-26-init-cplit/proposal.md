## Why

Claude CLI 的 hook 在执行非白名单命令时缺乏远程审批机制。用户需要在手机上实时审批敏感命令（如 `rm -rf`），而不是完全放行或完全阻断。

## What Changes

- 新增 Cplit 服务：接收 Hook 请求，通过飞书 Bot 发送审批消息，等待用户回复后返回决策
- 支持飞书卡片消息格式的审批请求
- 超时自动通过并发送通知
- 提供 Docker 部署支持

## Capabilities

### New Capabilities

- `approval-service`: 核心审批服务，管理请求生命周期、pendingMap、超时处理
- `feishu-integration`: 飞书消息发送、webhook 回调处理、卡片消息格式、tenant_token 缓存
- `config`: YAML 配置文件加载与解析

### Modified Capabilities

(无)

## Impact

- 新增 Node.js/TypeScript 服务项目
- 依赖飞书开放平台 API
- 通过 HTTP 与 Claude CLI Hook 交互（解耦）
