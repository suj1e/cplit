## ADDED Requirements

### Requirement: 接收审批请求

系统 SHALL 提供 `/request-approval` 接口，接收 Hook 发送的审批请求。

#### Scenario: 成功接收审批请求
- **WHEN** POST `/request-approval` with body `{ "command": "rm -rf build", "cwd": "/gateway-center" }`
- **THEN** 系统 SHALL 生成 4 位随机 requestId
- **THEN** 系统 SHALL 将请求存入 pendingMap
- **THEN** 系统 SHALL 调用飞书发送审批消息
- **THEN** 系统 SHALL 阻塞等待审批结果
- **THEN** 系统 SHALL 返回 `{ "decision": "approve" | "deny" }`

### Requirement: 生成唯一 requestId

系统 SHALL 为每个审批请求生成 4 位数字的 requestId。

#### Scenario: requestId 格式正确
- **WHEN** 生成 requestId
- **THEN** requestId SHALL 为 4 位数字字符串（如 "1823"）

### Requirement: 超时自动通过

系统 SHALL 在配置的超时时间后自动通过审批并发送通知。

#### Scenario: 超时自动通过
- **WHEN** 审批请求等待超过 60 秒（可配置）未收到回复
- **THEN** 系统 SHALL 自动返回 `allow`
- **THEN** 系统 SHALL 发送飞书通知 "审批超时已自动通过"

### Requirement: 处理审批回调

系统 SHALL 提供 `/feishu/webhook` 接口，接收飞书消息回调。

#### Scenario: 解析 approve 指令
- **WHEN** 收到消息内容为 "approve 1823"
- **THEN** 系统 SHALL resolve requestId "1823" 对应的 pending 请求
- **THEN** 系统 SHALL 返回 decision "approve"
- **THEN** 系统 SHALL 从 pendingMap 中删除该条目

#### Scenario: 解析 deny 指令
- **WHEN** 收到消息内容为 "deny 1823"
- **THEN** 系统 SHALL resolve requestId "1823" 对应的 pending 请求
- **THEN** 系统 SHALL 返回 decision "deny"
- **THEN** 系统 SHALL 从 pendingMap 中删除该条目

#### Scenario: 处理飞书 challenge 验证
- **WHEN** 收到飞书配置验证请求 `{ "type": "url_verification", "challenge": "xxx" }`
- **THEN** 系统 SHALL 返回 `{ "challenge": "xxx" }`

### Requirement: pendingMap 管理

系统 SHALL 使用内存 Map 管理 pending 请求。

#### Scenario: 存储和删除 pending 请求
- **WHEN** 新审批请求进入
- **THEN** 系统 SHALL 以 requestId 为 key 存入 pendingMap
- **WHEN** 审批完成（approve/deny/timeout）
- **THEN** 系统 SHALL 从 pendingMap 中删除该条目
