/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  assetPrefix: undefined,
  // images: {
  //   domains: ["raw.githubusercontent.com"],
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*'
      },
    ],
  },
};

module.exports = nextConfig;
