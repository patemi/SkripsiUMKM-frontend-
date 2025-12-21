/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimasi performa
  reactStrictMode: true,
  
  // Optimasi build
  swcMinify: true,
  
  // Optimasi image
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Optimasi webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimasi bundle size untuk client
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk untuk dependencies besar
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20
            },
            // Chart.js dalam chunk terpisah karena besar
            charts: {
              name: 'charts',
              test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // Common chunk untuk kode yang sering dipakai
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true
            }
          }
        }
      };
    }
    return config;
  },
  
  // Experimental features untuk performa
  experimental: {
    // optimizeCss: true, // Disabled karena error "Cannot find module 'critters'"
    optimizePackageImports: ['@/components', '@/lib'],
  },
  
  // Kompresi output
  compress: true,
  
  // Powering by header (optional)
  poweredByHeader: false,
};

module.exports = nextConfig;
