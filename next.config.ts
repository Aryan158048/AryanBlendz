import type { NextConfig } from 'next'
import os from 'os'

// Automatically detect all local network IPs so mobile devices always work,
// regardless of which WiFi network the Mac is on.
function getLanIPs(): string[] {
  const ips: string[] = []
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const addr of iface ?? []) {
      if (addr.family === 'IPv4' && !addr.internal) {
        ips.push(addr.address)
      }
    }
  }
  return ips
}

const lanIPs = getLanIPs()

const nextConfig: NextConfig = {
  // Allow dev resources (HMR/webpack) from any LAN IP
  allowedDevOrigins: lanIPs,
  experimental: {
    serverActions: {
      // Allow server actions from any LAN IP (CSRF protection)
      allowedOrigins: lanIPs.map((ip) => `${ip}:3000`),
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
}

export default nextConfig
