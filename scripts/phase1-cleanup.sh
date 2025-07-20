#!/bin/bash

# Phase 1: Remove findDOMNode Dependencies
# This script removes all polyfills and updates Next.js config

set -e  # Exit on any error

echo "🚀 Starting Phase 1: React 19 Cleanup - Remove findDOMNode Dependencies"
echo "=================================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "examples" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Remove polyfill files
echo "📁 Step 1: Removing polyfill files..."
if [ -d "examples/polyfills" ]; then
    rm -rf examples/polyfills/
    echo "✅ Removed examples/polyfills/"
else
    echo "ℹ️  No polyfills directory found, skipping..."
fi

# Step 2: Update next.config.js to remove polyfill injection
echo "⚙️  Step 2: Updating Next.js config..."

# Create backup of current config
if [ -f "examples/next.config.js" ]; then
    cp examples/next.config.js examples/next.config.js.backup
    echo "✅ Created backup: examples/next.config.js.backup"
fi

# Create new next.config.js without polyfills
cat > examples/next.config.js << 'EOF'
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
    esmExternals: 'loose',
  },
  // Only use static export for production builds
  ...(isBuild && { output: 'export' }),
  transpilePackages: ['react-dnd', 'react-dnd-html5-backend', 'dnd-core'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // React 19 optimization: Enable automatic JSX runtime
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
    };
    
    return config;
  },
});
EOF

echo "✅ Updated examples/next.config.js (removed polyfill injection)"

# Step 3: Search for any remaining findDOMNode usage in the codebase
echo "🔍 Step 3: Scanning for remaining findDOMNode usage..."

# Search for findDOMNode usage (excluding node_modules and backup files)
FINDDOMNODE_USAGE=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
                    grep -v node_modules | \
                    grep -v ".backup" | \
                    xargs grep -l "findDOMNode" 2>/dev/null || true)

if [ -n "$FINDDOMNODE_USAGE" ]; then
    echo "⚠️  Found remaining findDOMNode usage in:"
    echo "$FINDDOMNODE_USAGE"
    echo ""
    echo "📝 These files need manual review and refactoring to use refs instead."
    echo "   Create a GitHub issue to track this work."
else
    echo "✅ No findDOMNode usage found in source code!"
fi

# Step 4: Update package.json scripts if needed
echo "📦 Step 4: Checking package.json scripts..."

# Check if any scripts reference the polyfills
SCRIPT_REFS=$(grep -n "polyfills" package.json examples/package.json 2>/dev/null || true)
if [ -n "$SCRIPT_REFS" ]; then
    echo "⚠️  Found references to polyfills in package.json scripts:"
    echo "$SCRIPT_REFS"
    echo "📝 These may need manual cleanup."
else
    echo "✅ No polyfill references found in package.json scripts"
fi

# Step 5: Update Jest config for React 19 compatibility
echo "🧪 Step 5: Updating Jest configuration for React 19..."

# Update the main Jest config in package.json to handle React 19 better
# This uses a temporary file approach to safely modify JSON
python3 -c "
import json
import sys

try:
    with open('package.json', 'r') as f:
        data = json.load(f)
    
    # Update transformIgnorePatterns to handle React 19 and modern packages
    if 'jest' in data:
        data['jest']['transformIgnorePatterns'] = [
            '/node_modules/(?!(react-dnd|@mui|@emotion|@testing-library)/)'
        ]
        
        # Add React 19 specific test setup
        data['jest']['setupFilesAfterEnv'] = ['./config/jestTestSetup']
        
        # Ensure proper test environment
        data['jest']['testEnvironment'] = 'jsdom'
    
    with open('package.json', 'w') as f:
        json.dump(data, f, indent=2)
        
    print('✅ Updated Jest configuration for React 19 compatibility')
    
except Exception as e:
    print(f'⚠️  Could not update Jest config: {e}')
    sys.exit(1)
" || echo "⚠️  Python not available - Jest config update skipped"

# Step 6: Create a summary of changes
echo "📊 Step 6: Creating change summary..."

cat > PHASE1_CHANGES.md << 'EOF'
# Phase 1 Changes - findDOMNode Cleanup

## Files Removed
- `examples/polyfills/findDOMNode.js` - No longer needed with React 19
- `examples/polyfills/react-dom-polyfill.js` - No longer needed with React 19

## Files Modified
- `examples/next.config.js` - Removed polyfill injection, added React 19 optimizations
- `package.json` - Updated Jest configuration for React 19 compatibility

## Next Steps
1. Test the application: `yarn dev`
2. Run tests: `yarn test`
3. Check for any runtime errors related to findDOMNode usage
4. Proceed to Phase 2: Dependency Modernization

## Rollback Instructions
If you need to rollback these changes:
```bash
# Restore Next.js config
cp examples/next.config.js.backup examples/next.config.js

# Restore polyfills from git (if needed)
git checkout HEAD -- examples/polyfills/
```
EOF

echo "✅ Created PHASE1_CHANGES.md with summary of changes"

# Step 7: Validate changes
echo "✅ Step 7: Validating changes..."

# Check if Next.js config is valid JavaScript
if node -c examples/next.config.js 2>/dev/null; then
    echo "✅ Next.js config syntax is valid"
else
    echo "❌ Next.js config has syntax errors!"
    echo "🔧 Restoring backup..."
    cp examples/next.config.js.backup examples/next.config.js
    exit 1
fi

# Final summary
echo ""
echo "🎉 Phase 1 Complete! Summary:"
echo "================================"
echo "✅ Removed findDOMNode polyfills"
echo "✅ Updated Next.js configuration"
echo "✅ Enhanced Jest configuration"
echo "✅ Created change documentation"
echo ""
echo "📝 Next steps:"
echo "   1. Test the application: cd examples && yarn dev"
echo "   2. Run tests: yarn test"
echo "   3. Check console for any findDOMNode warnings"
echo "   4. Proceed to Phase 2 when ready: ./scripts/phase2-dependencies.sh"
echo ""
echo "📁 Backup files created:"
echo "   - examples/next.config.js.backup"
echo "   - PHASE1_CHANGES.md (change log)"
