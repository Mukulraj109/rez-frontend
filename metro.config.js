const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add svg to asset extensions
config.resolver.assetExts.push('svg');

// Web shims configuration
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
  return context.resolveRequest(context, moduleName, platform);
};

// Suppress known harmless warnings from node_modules
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string') {
    // Suppress require cycle warnings from third-party packages
    if (args[0].includes('Require cycle:')) return;
    // Suppress shadow/textShadow deprecation warnings (handled via Platform.select in code)
    if (args[0].includes('"shadow*" style props are deprecated')) return;
    if (args[0].includes('"textShadow*" style props are deprecated')) return;
    // Suppress pointerEvents prop deprecation (we use prop syntax to avoid app freeze on web)
    if (args[0].includes('props.pointerEvents is deprecated')) return;
  }
  originalWarn(...args);
};

module.exports = config;
