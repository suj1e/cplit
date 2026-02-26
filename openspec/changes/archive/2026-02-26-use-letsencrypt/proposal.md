## Why

使用 Let's Encrypt 免费证书替代手动管理的 SSL 证书，简化部署流程。

## What Changes

- 更新 nginx.conf 使用 Let's Encrypt 证书路径
- 更新 docker-compose.yml 挂载 /etc/letsencrypt
- 删除 nginx/ssl/ 目录（不再需要）
- 更新 README.md 添加 Certbot 获取证书的说明

## Capabilities

### New Capabilities
(无)

### Modified Capabilities
(无 - 仅部署配置变更)

## Impact

- 修改 nginx/nginx.conf
- 修改 docker-compose.yml
- 更新 README.md
- 删除 nginx/ssl/ 目录
