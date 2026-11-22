/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/parsimezon-store/admin',
  assetPrefix: '/parsimezon-store/admin/',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
