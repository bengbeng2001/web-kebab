/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'kywjunpucwjezxmkrzeh.supabase.co'],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig; 