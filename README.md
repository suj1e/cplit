# Cplit

远程审批 / 命令管道服务。为 Claude CLI Hook 提供飞书审批能力。

## 工作原理

```
Claude CLI Hook → Cplit Service → 飞书 Bot → 用户手机
                                      ↑
                              /feishu/webhook 回调
```

1. Hook 拦截敏感命令，调用 `/request-approval`
2. Cplit 通过飞书发送审批卡片
3. 用户手机回复 `approve {id}` 或 `deny {id}`
4. Cplit 返回决策给 Hook，决定是否执行

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发
pnpm dev

# 构建
pnpm build

# 生产运行
pnpm start

# 代码检查
pnpm lint
```

## 配置

支持两种配置方式：配置文件或环境变量。环境变量优先级更高。

### 方式一：配置文件

```bash
cp cplit.config.example.yaml cplit.config.yaml
```

编辑 `cplit.config.yaml`：

```yaml
server:
  port: 3000

feishu:
  app_id: "cli_xxx"
  app_secret: "xxx"
  approver_id: "ou_xxx"  # 接收审批消息的用户 ID

approval:
  timeout: 60000  # 超时时间（毫秒），默认 60s
```

### 方式二：环境变量

| 环境变量 | 对应配置 |
|---------|---------|
| `SERVER_PORT` | `server.port` |
| `FEISHU_APP_ID` | `feishu.app_id` |
| `FEISHU_APP_SECRET` | `feishu.app_secret` |
| `FEISHU_APPROVER_ID` | `feishu.approver_id` |
| `APPROVAL_TIMEOUT` | `approval.timeout` |

示例：

```bash
export FEISHU_APP_ID="cli_xxx"
export FEISHU_APP_SECRET="xxx"
export FEISHU_APPROVER_ID="ou_xxx"
pnpm start
```

## Docker 部署

```bash
docker-compose up -d
```

## Hook 示例

```bash
#!/usr/bin/env bash
CMD="$1"
PWD="$PWD"

decision=$(curl -s -X POST http://127.0.0.1:3000/request-approval \
  -H "Content-Type: application/json" \
  -d '{"command":"'"$CMD"'","cwd":"'"$PWD"'"}')

if [ "$(echo $decision | jq -r '.decision')" = "approve" ]; then
  exit 0
else
  exit 1
fi
```

## API

### POST /request-approval

请求审批：

```json
{
  "command": "rm -rf build",
  "cwd": "/gateway-center"
}
```

返回：

```json
{
  "decision": "approve"  // 或 "deny"
}
```

### POST /feishu/webhook

飞书回调端点，用于接收用户回复。
