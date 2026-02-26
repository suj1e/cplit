## Why

当前用户需要手动回复 "approve 1823" 或 "deny 1823"，体验不够友好。使用飞书交互式卡片按钮，用户可以一键完成审批。

## What Changes

- 审批卡片增加"批准"和"拒绝"按钮
- 添加飞书卡片回调处理端点
- 用户点击按钮后更新卡片状态

## Capabilities

### New Capabilities

(无 - 扩展现有 feishu-integration)

### Modified Capabilities

- `feishu-integration`: 支持交互式卡片和回调处理

## Impact

- 修改 `src/services/feishu.ts` 发送交互式卡片
- 新增 `src/routes/card-callback.ts` 处理卡片回调
- 更新 `src/index.ts` 注册新路由
- 飞书开放平台需配置卡片回调 URL
