## Context

Cplit 服务需要通过域名 dmall.ink 对外提供 HTTPS 访问，以便飞书 webhook 能够回调。

## Goals / Non-Goals

**Goals:**
- Nginx 反向代理到 Cplit 服务
- HTTPS 支持（使用已有证书）
- HTTP → HTTPS 重定向

**Non-Goals:**
- 自动证书申请（Certbot）
- 负载均衡
- 多域名支持

## Decisions

### 架构：docker-compose 多容器

```
nginx 容器 (:80, :443) → cplit 容器 (:3000)
```

**理由：** 职责分离，符合 Docker 最佳实践。

**备选：** 单容器 Nginx + Node（需要 supervisor，复杂且不推荐）

### SSL 证书挂载

证书文件放在 `nginx/ssl/` 目录，挂载到容器内。

**理由：** 简单直接，证书更新只需替换文件并重启容器。

### Nginx 配置

- HTTP 重定向到 HTTPS
- 反向代理所有请求到 cplit:3000
- 保留真实 IP 头

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| 证书过期 | 用户自行管理，建议设置提醒 |
| 证书文件泄露 | 已在 .gitignore 中排除 nginx/ssl/ |

## 文件结构

```
cplit/
├── docker-compose.yml
├── nginx/
│   ├── nginx.conf
│   └── ssl/
│       ├── dmall.ink.pem
│       └── dmall.ink.key
```
