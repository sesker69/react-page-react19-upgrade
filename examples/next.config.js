const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const path = require('path');

// Only use static export for production builds
const isProduction = process.env.NODE_ENV === 'production';
const isBuild = process.env.npm_lifecycle_event === 'build';

module.exports = withBundleAnalyzer({
  basePath: process.env.RELEASE_CHANNEL
    ? !process.env.RELEASE_CHANNEL || process.env.RELEASE_CHANNEL === 'latest'
      ? '/'
      : '/' + process.env.RELEASE_CHANNEL
    : undefined,
  async rewrites() {
    return [
      {
        source: '/docs',
        destination: '/docs/index.html',
      },
    ];
  },
  productionBrowserSourceMaps: true,
  compiler: {
    // ssr and displayName are configured by default
    styledComponents: true,
  },
  experimental: {
    // Remove deprecated esmExternals
    esmExternals: false,
  },
  // Only use static export for production builds
  ...(isBuild && { output: 'export' }),
  transpilePackages: [
    'react-dnd',
    'react-dnd-html5-backend',
    'dnd-core',
    'react-syntax-highlighter',
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Prefer ES modules for our packages
    config.resolve.mainFields = ['module', 'main'];

    // Handle ESM dependencies by marking them as external for server builds
    // and allowing them to be bundled for client builds
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        'react-dnd',
        'react-dnd-html5-backend',
        'dnd-core',
      ];
    }

    // Add polyfill for findDOMNode
    const originalEntry = config.entry;
    config.entry = async () => {
      const entries = await originalEntry();
      if (
        entries['main.js'] &&
        !entries['main.js'].includes('./polyfills/react-dom-polyfill.js')
      ) {
        entries['main.js'].unshift('./polyfills/react-dom-polyfill.js');
      }
      return entries;
    };

    return config;
  },
});
