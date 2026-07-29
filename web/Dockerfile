# 推し活OS Webアプリ(Next.js + SQLite)
FROM node:22-slim

WORKDIR /app

# 依存関係を先にインストール(ビルドキャッシュを効かせる)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# アプリ本体をコピーしてビルド
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# SQLite は /app/data に作成される(永続ディスクをここにマウントする)
CMD ["npm", "start"]
