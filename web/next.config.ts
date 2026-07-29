import type { NextConfig } from "next";

// GitHub Pages などの静的ホスティング向け設定。
// BASE_PATH はデプロイ先のサブパス(例: /oshikatsu)。CIで設定される。
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.BASE_PATH ?? "",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
