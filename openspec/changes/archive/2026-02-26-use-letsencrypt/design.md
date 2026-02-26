## Context

Let's Encrypt 提供免费的 SSL 证书，有效期 90 天，支持自动续期。

## Goals / Non-Goals

**Goals:**
- 使用 Let's Encrypt 证书
- 配置自动续期方式
- 简化证书管理

**Non-Goals:**
- 容器内自动续期（使用 cron 即可）

## Decisions

### 证书获取方式：Certbot standalone 模式

```bash
certbot certonly --standalone -d dmall.ink
```

**理由：** 简单直接，不需要修改 Nginx 配置来验证域名。

### 证书存储位置

主机 `/etc/letsencrypt/`，挂载到 Nginx 容器。

**理由：** 标准位置，方便续期。

### 续期方式

主机 cron 定时任务 + docker restart nginx。

## 文件变更

```
nginx/nginx.conf        # 更新证书路径
docker-compose.yml      # 更新挂载路径
README.md               # 添加 Certbot 说明
nginx/ssl/              # 删除
```
