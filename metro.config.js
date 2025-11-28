const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolver for @ alias
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname),
};

// Ensure proper extensions are resolved
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'];

module.exports = config;
