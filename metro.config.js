const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// =============================================================================
// MEMORY OPTIMIZATION SETTINGS (Prevent bundler crashes during long dev sessions)
// =============================================================================

// Limit parallel workers - reduces memory significantly
// Default uses all CPU cores which consumes too much memory
// Use 50% of available cores for better balance
config.maxWorkers = Math.max(1, Math.floor(require('os').cpus().length * 0.5));

// Transformer optimizations
config.transformer = {
  ...config.transformer,
  // Reduce memory during minification
  minifierConfig: {
    compress: {
      reduce_funcs: false,
      reduce_vars: false,
    },
  },
  // Enable inline requires for better performance (but can use more memory)
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true, // Enable for faster startup
    },
  }),
};

// Watcher optimizations - critical for memory
config.watcher = {
  ...config.watcher,
  // Disable health checks
  healthCheck: {
    enabled: false,
  },
  // Use polling with longer interval (reduces CPU/memory)
  watchman: {
    deferStates: ['hg.update', 'hg.transaction'],
  },
};

// Resolver optimizations
config.resolver = {
  ...config.resolver,
  // Exclude heavy directories from resolution
  blockList: [
    /node_modules\/.*\/node_modules/,
    /\.git\/.*/,
    /android\/\.gradle\/.*/,
    /ios\/Pods\/.*/,
    /__tests__\/.*/,
    /\.test\.(js|jsx|ts|tsx)$/,
    /\.spec\.(js|jsx|ts|tsx)$/,
    /\.example\.(js|jsx|ts|tsx)$/,
  ],
  // Cache resolver results
  hasteImplModulePath: undefined,
};

// Server optimizations
config.server = {
  ...config.server,
  // Enhance delta bundler for memory efficiency
  enhanceMiddleware: (middleware) => middleware,
};

// Cache settings - enable caching for faster rebuilds
// Use FileStore for persistent cache (faster subsequent builds)
try {
  const { FileStore } = require('metro-cache');
  config.cacheStores = [
    new FileStore({
      root: require('path').join(__dirname, 'node_modules/.cache/metro'),
    }),
  ];
} catch (error) {
  // metro-cache might not be available, use default cache
  console.warn('metro-cache not available, using default cache');
  config.cacheStores = [];
}

// =============================================================================
// ASSET EXTENSIONS
// =============================================================================

// Add svg to asset extensions
config.resolver.assetExts.push('svg');

// =============================================================================
// WEB SHIMS CONFIGURATION
// =============================================================================

const shimPath = path.resolve(__dirname, 'web-shims');
const rnWebExports = path.resolve(__dirname, 'node_modules/react-native-web/dist/exports');

// Internal react-native modules to shim for web
const webShims = {
  'Utilities/Platform': path.join(rnWebExports, 'Platform/index.js'),
  'PlatformColorValueTypes': path.join(shimPath, 'PlatformColorValueTypes.js'),
  'RendererProxy': path.join(shimPath, 'RendererProxy.js'),
  'BaseViewConfig': path.join(shimPath, 'BaseViewConfig.js'),
  'PlatformBaseViewConfig': path.join(shimPath, 'BaseViewConfig.js'),
  'ReactNativeTypes': path.join(shimPath, 'ReactNativeTypes.js'),
  'NativeComponent': path.join(shimPath, 'empty.js'),
  'TextInputState': path.join(shimPath, 'TextInputState.js'),
};

// Packages that need full replacement on web
const webPackageShims = {
  '@stripe/stripe-react-native': path.join(shimPath, 'stripe-react-native.js'),
};

// Redirect react-native internals to web-compatible shims
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    // Check for full package replacements
    for (const [pkg, shimFile] of Object.entries(webPackageShims)) {
      if (moduleName === pkg || moduleName.startsWith(pkg + '/')) {
        return { filePath: shimFile, type: 'sourceFile' };
      }
    }
    // Check for internal module shims
    for (const [pattern, shimFile] of Object.entries(webShims)) {
      if (moduleName.includes(pattern)) {
        return { filePath: shimFile, type: 'sourceFile' };
      }
    }
  }
  // Use original resolver or default
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// =============================================================================
// SUPPRESS WARNINGS (Reduce console memory usage)
// =============================================================================

const originalWarn = console.warn;
const originalLog = console.log;
const originalDebug = console.debug;

// Throttle repeated warnings
const warnCache = new Set();
const WARN_CACHE_LIMIT = 100;

console.warn = (...args) => {
  if (typeof args[0] === 'string') {
    // Suppress known harmless warnings
    if (args[0].includes('Require cycle:')) return;
    if (args[0].includes('"shadow*" style props are deprecated')) return;
    if (args[0].includes('"textShadow*" style props are deprecated')) return;
    if (args[0].includes('props.pointerEvents is deprecated')) return;

    // Deduplicate repeated warnings
    const key = args[0].slice(0, 100);
    if (warnCache.has(key)) return;
    if (warnCache.size >= WARN_CACHE_LIMIT) warnCache.clear();
    warnCache.add(key);
  }
  originalWarn(...args);
};

// Suppress excessive debug logs in development
console.debug = (...args) => {
  if (typeof args[0] === 'string') {
    // Suppress noisy debug messages
    if (args[0].includes('[BillUploadAnalytics]')) return;
    if (args[0].includes('[BOTTOM NAV]')) return;
  }
  originalDebug(...args);
};

module.exports = config;
