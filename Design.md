# Cplit - 远程审批 / 命令管道服务文档

## 1. 系统概览

**目标：** Claude CLI 的 hook 遇到非白名单命令时，通过企业自建飞书 Bot 发起审批，用户回复后返回 CLI 执行决策。hook 支持可选启用飞书监听。

**核心流程：**

```
Claude CLI Hook → Cplit Service → 飞书 API → 用户手机
                                        ↑
                                /feishu/webhook 回调
```

- Hook 阻塞等待审批结果（可选启用飞书监听）
- Cplit 管理 requestId、pendingMap、消息发送与回调处理
- 飞书 Bot 充当消息通道

## 2. 架构组件

| 组件 | 功能 |
|------|------|
| Hook 脚本（Shell） | 拦截命令，调用 /request-approval 并等待结果，可选启用飞书监听 |
| Cplit Service（Node/Express） | 核心审批服务，管理消息、回调与 pendingMap |
| 飞书 Bot | 消息通道，接收审批请求、转发用户回复 |
| 用户手机 | 接收审批消息并回复 approve/deny |

## 3. 接口说明

### 3.1 /request-approval (Hook 调用)

**方法：** POST
**URL：** `http://127.0.0.1:3000/request-approval`

**请求 body：**

```json
{
  "command": "rm -rf build",
  "cwd": "/gateway-center"
}
```

**返回（阻塞等待审批结果）：**

```json
{
  "decision": "approve" // 或 "deny"
}
```

**流程：**

1. 生成 requestId
2. 保存到 pendingMap
3. 调用飞书发送消息 API（如果启用监听）
4. 等待 /feishu/webhook 回调 resolve
5. 超时默认 deny

### 3.2 /feishu/webhook (飞书回调)

**方法：** POST
**URL：** `https://bot.yourdomain.com/feishu/webhook`

**示例 body：**

```json
{
  "type": "event_callback",
  "event": {
    "type": "message",
    "message": { "text": "approve 1823" },
    "sender": { "id": "ou_xxx" }
  }
}
```

**第一次配置 challenge 返回：**

```json
{
  "challenge": "random_string"
}
```

### 3.3 飞书发送消息 API

**接口：** POST `https://open.feishu.cn/open-apis/im/v1/messages`

**示例请求：**

```json
{
  "receive_id_type": "user_id",
  "receive_id": "用户 open_id",
  "msg_type": "text",
  "content": "{\"text\":\"🔐 Claude 请求权限\\n命令: rm -rf build\\n回复 approve 1823 或 deny 1823\"}"
}
```

## 4. Hook 示例 (Shell)

```bash
#!/usr/bin/env bash

CMD="$1"
PWD="$PWD"
ENABLE_FEISHU_LISTEN=${ENABLE_FEISHU_LISTEN:-true}

if [ "$ENABLE_FEISHU_LISTEN" = true ]; then
  decision=$(curl -s -X POST http://127.0.0.1:3000/request-approval \
    -H "Content-Type: application/json" \
    -d '{"command":"'"$CMD"'","cwd":"'"$PWD"'"}')
else
  decision="approve"  # 本地直接执行，不走飞书监听
fi

if [ "$decision" = "approve" ]; then
  exit 0
else
  exit 1
fi
```

## 5. Cplit Service 核心逻辑

- pendingMap 管理 requestId → Promise
- /request-approval 处理 Hook 请求并调用飞书 API（如果启用监听）
- /feishu/webhook 接收回调解析 approve/deny
- 超时策略（如 60 秒默认 deny）
- 模块化设计支持未来多渠道、多审批人扩展

## 6. 公网配置

- 服务器公网 IP / HTTPS 域名，证书有效
- Nginx 或 Cloudflare 反向代理到本地 3000
- 飞书事件订阅地址：`https://bot.yourdomain.com/feishu/webhook`
- 事件类型：`im.message.receive_v1`
- 权限：`im:message`、`im:message.receive`、`contact:user.base:readonly`
- 应用发布新版本

## 7. 系统可扩展性

- 多渠道：Discord / Slack / Teams 等
- 多审批人支持
- 自动审批规则扩展
- 日志 / 审计功能
- 可选启用/禁用飞书监听

## 8. 注意事项

- Hook 不直接调用飞书 API，全部通过 Cplit
- 飞书回调必须处理 challenge 验证
- 超时策略必须设置
- 用户必须在可用范围内
- 可选启用飞书监听，提高灵活性
