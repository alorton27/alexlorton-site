/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'substackcdn.com' },
      { protocol: 'https', hostname: 'public.substack.com' },
      { protocol: 'https', hostname: '*.substack.com' }, // safety net
    ],
  },
};
module.exports = nextConfig;
