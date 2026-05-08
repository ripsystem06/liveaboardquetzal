/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'solmarv.com',
      },
      {
        protocol: 'https',
        hostname: 'images.fineartamerica.com',
      },
      {
        protocol: 'https',
        hostname: 'vjs.zencdn.net',
      },
    ],
  },
}

export default nextConfig
