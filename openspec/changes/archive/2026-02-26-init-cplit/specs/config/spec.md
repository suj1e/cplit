## ADDED Requirements

### Requirement: 加载 YAML 配置文件

系统 SHALL 从项目目录加载 `cplit.config.yaml` 配置文件。

#### Scenario: 成功加载配置
- **WHEN** 服务启动
- **THEN** 系统 SHALL 读取 `./cplit.config.yaml` 文件
- **THEN** 系统 SHALL 解析为配置对象

### Requirement: 配置结构

系统 SHALL 支持以下配置结构：

#### Scenario: 完整配置
- **WHEN** 配置文件包含以下字段
- **THEN** 系统 SHALL 正确解析：

```yaml
server:
  port: 3000

feishu:
  app_id: "cli_xxx"
  app_secret: "xxx"
  approver_id: "ou_xxx"

approval:
  timeout: 60000  # 毫秒
```

### Requirement: 配置验证

系统 SHALL 验证必要配置项存在。

#### Scenario: 缺少必要配置
- **WHEN** 配置文件缺少 `feishu.app_id`、`feishu.app_secret` 或 `feishu.approver_id`
- **THEN** 系统 SHALL 抛出错误并拒绝启动

#### Scenario: 使用默认值
- **WHEN** `server.port` 未配置
- **THEN** 系统 SHALL 使用默认值 3000
- **WHEN** `approval.timeout` 未配置
- **THEN** 系统 SHALL 使用默认值 60000
