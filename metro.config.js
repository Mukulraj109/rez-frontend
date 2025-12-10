const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add svg to asset extensions
config.resolver.assetExts.push('svg');

module.exports = config;
