/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  assetPrefix: "./",
  distDir: "extensions/dist",
  output: "export",
};

module.exports = nextConfig;
