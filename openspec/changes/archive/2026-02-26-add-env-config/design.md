## Context

当前配置系统只支持 YAML 文件加载。需要支持环境变量覆盖，以便：
1. 生产环境安全地注入密钥
2. 避免敏感信息被误提交到 git

## Goals / Non-Goals

**Goals:**
- 支持环境变量覆盖配置文件中的任意字段
- 环境变量优先级高于配置文件
- 保持向后兼容（现有配置文件仍可正常使用）

**Non-Goals:**
- 不支持 .env 文件解析（用户可用 dotenv 等工具自行加载）
- 不改变现有配置结构

## Decisions

### 环境变量命名规范

使用 `大写` + `下划线` 格式：

| 配置路径 | 环境变量 |
|---------|---------|
| `server.port` | `SERVER_PORT` |
| `feishu.app_id` | `FEISHU_APP_ID` |
| `feishu.app_secret` | `FEISHU_APP_SECRET` |
| `feishu.approver_id` | `FEISHU_APPROVER_ID` |
| `approval.timeout` | `APPROVAL_TIMEOUT` |

**备选:** `CPLIT_SERVER_PORT`（带前缀）- 但本项目只有一个服务，前缀冗余

### 优先级

```
环境变量 > 配置文件 > 默认值
```

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| 环境变量名拼写错误导致配置未生效 | 启动时打印最终配置（隐藏敏感值） |
