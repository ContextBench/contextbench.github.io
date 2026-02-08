import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 如果部署在 https://<username>.github.io/<repo-name>/ 下，请取消下行的注释并修改为你的仓库名
  basePath: '',
};

export default nextConfig;
