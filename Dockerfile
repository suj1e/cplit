FROM node:20-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (production only)
RUN pnpm install --frozen-lockfile --prod || pnpm install --prod

# Copy built code
COPY dist ./dist
COPY cplit.config.yaml ./

EXPOSE 3000

CMD ["node", "dist/index.js"]
