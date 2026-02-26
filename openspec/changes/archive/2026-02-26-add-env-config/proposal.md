## Why

当前配置只能通过 `cplit.config.yaml` 文件加载，敏感信息（如 `feishu.app_secret`）容易被误提交到 git。生产环境通常使用环境变量管理密钥更安全。

## What Changes

- 支持环境变量覆盖配置文件中的值
- 环境变量优先级高于配置文件
- 创建 `cplit.config.example.yaml` 模板供参考
- 更新 `.gitignore` 忽略 `cplit.config.yaml`

## Capabilities

### New Capabilities

(无)

### Modified Capabilities

- `config`: 支持环境变量覆盖配置值

## Impact

- 修改 `src/config.ts`
- 新增 `cplit.config.example.yaml`
- 更新 `.gitignore`
- 更新 `README.md` 文档
