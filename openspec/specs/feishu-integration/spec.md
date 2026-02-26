## ADDED Requirements

### Requirement: 发送审批消息卡片

系统 SHALL 通过飞书 API 发送审批请求卡片消息。

#### Scenario: 发送审批卡片
- **WHEN** 需要发送审批请求
- **THEN** 系统 SHALL 调用飞书 `POST /open-apis/im/v1/messages` API
- **THEN** 消息内容 SHALL 为卡片格式，包含：命令、目录、requestId
- **THEN** 卡片 SHALL 提示用户回复 "approve {requestId}" 或 "deny {requestId}"

### Requirement: 发送超时通知卡片

系统 SHALL 在审批超时后发送通知卡片。

#### Scenario: 发送超时通知
- **WHEN** 审批超时自动通过
- **THEN** 系统 SHALL 发送飞书卡片通知
- **THEN** 通知内容 SHALL 包含：原命令、超时说明

### Requirement: tenant_access_token 缓存

系统 SHALL 缓存飞书 tenant_access_token 并在过期前刷新。

#### Scenario: 获取并缓存 token
- **WHEN** 需要调用飞书 API
- **THEN** 系统 SHALL 检查缓存的 token 是否有效
- **WHEN** token 无效或即将过期（提前 5 分钟）
- **THEN** 系统 SHALL 调用 `POST /open-apis/auth/v3/tenant_access_token/internal` 获取新 token
- **THEN** 系统 SHALL 缓存 token 及过期时间（2 小时）

### Requirement: 处理飞书 webhook 事件

系统 SHALL 解析飞书 webhook 发送的消息事件。

#### Scenario: 解析消息事件
- **WHEN** 收到飞书 webhook 事件 `{ "type": "event_callback", "event": { "type": "message", "message": { "text": "approve 1823" } } }`
- **THEN** 系统 SHALL 提取消息文本内容
- **THEN** 系统 SHALL 解析指令类型（approve/deny）和 requestId
