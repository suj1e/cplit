## Why

需要通过域名 dmall.ink 提供 HTTPS 访问，用于接收飞书 webhook 回调。当前只有 Node.js 直接暴露端口，缺少反向代理和 SSL 终止。

## What Changes

- 添加 Nginx 容器作为反向代理
- 支持 HTTPS（使用已有证书）
- HTTP 自动重定向到 HTTPS
- 更新 docker-compose.yml 编排两个容器

## Capabilities

### New Capabilities

(无 - 这是部署配置，不影响系统功能)

### Modified Capabilities

(无)

## Impact

- 新增 nginx/ 目录及配置文件
- 更新 docker-compose.yml
- 更新 README.md 部署说明
