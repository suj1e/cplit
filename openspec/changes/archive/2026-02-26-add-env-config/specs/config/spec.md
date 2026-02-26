## MODIFIED Requirements

### Requirement: 加载 YAML 配置文件

系统 SHALL 从项目目录加载 `cplit.config.yaml` 配置文件，并支持环境变量覆盖。

#### Scenario: 成功加载配置
- **WHEN** 服务启动
- **THEN** 系统 SHALL 读取 `./cplit.config.yaml` 文件（如果存在）
- **THEN** 系统 SHALL 解析为配置对象

#### Scenario: 配置文件不存在时使用环境变量
- **WHEN** `cplit.config.yaml` 文件不存在
- **THEN** 系统 SHALL 从环境变量加载所有必填配置
- **THEN** 系统 SHALL 正常启动

#### Scenario: 环境变量覆盖配置文件
- **WHEN** 设置了环境变量 `FEISHU_APP_SECRET`
- **AND** `cplit.config.yaml` 中也配置了 `feishu.app_secret`
- **THEN** 系统 SHALL 使用环境变量的值

### Requirement: 配置验证

系统 SHALL 验证必要配置项存在（来自配置文件或环境变量）。

#### Scenario: 缺少必要配置
- **WHEN** 配置文件和环境变量都缺少 `feishu.app_id`、`feishu.app_secret` 或 `feishu.approver_id`
- **THEN** 系统 SHALL 抛出错误并拒绝启动

#### Scenario: 使用默认值
- **WHEN** `server.port` 和 `SERVER_PORT` 都未配置
- **THEN** 系统 SHALL 使用默认值 3000
- **WHEN** `approval.timeout` 和 `APPROVAL_TIMEOUT` 都未配置
- **THEN** 系统 SHALL 使用默认值 60000

## ADDED Requirements

### Requirement: 环境变量支持

系统 SHALL 支持通过环境变量配置所有字段。

#### Scenario: 环境变量命名规范
- **WHEN** 需要通过环境变量配置
- **THEN** 系统 SHALL 支持以下环境变量：
  - `SERVER_PORT`
  - `FEISHU_APP_ID`
  - `FEISHU_APP_SECRET`
  - `FEISHU_APPROVER_ID`
  - `APPROVAL_TIMEOUT`

#### Scenario: 环境变量优先级
- **WHEN** 同一字段同时存在于配置文件和环境变量
- **THEN** 系统 SHALL 优先使用环境变量的值
