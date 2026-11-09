/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', 'gsap', 'lenis'],
  output: 'export',
  trailingSlash: true,
  basePath: isProd ? '/kalkulator-topsis' : '',
  assetPrefix: isProd ? '/kalkulator-topsis' : '',
};

export default nextConfig;

