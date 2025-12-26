/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@jobmatch/shared', 'three'],
};

module.exports = nextConfig;
