## MODIFIED Requirements

### Requirement: 发送审批消息卡片

系统 SHALL 通过飞书 API 发送带交互按钮的审批请求卡片消息。

#### Scenario: 发送审批卡片
- **WHEN** 需要发送审批请求
- **THEN** 系统 SHALL 调用飞书 `POST /open-apis/im/v1/messages` API
- **THEN** 消息内容 SHALL 为交互式卡片格式，包含：命令、目录、requestId
- **THEN** 卡片 SHALL 包含"批准"和"拒绝"按钮

## ADDED Requirements

### Requirement: 处理卡片按钮回调

系统 SHALL 处理飞书卡片按钮点击回调。

#### Scenario: 解析卡片回调
- **WHEN** 收到飞书卡片回调请求
- **THEN** 系统 SHALL 解析回调数据中的 action（approve/deny）和 requestId
- **THEN** 系统 SHALL resolve 对应的 pending 请求
- **THEN** 系统 SHALL 更新卡片显示处理结果

#### Scenario: 更新卡片状态
- **WHEN** 用户点击"批准"按钮
- **THEN** 系统 SHALL 将卡片更新为"已批准"状态
- **WHEN** 用户点击"拒绝"按钮
- **THEN** 系统 SHALL 将卡片更新为"已拒绝"状态
