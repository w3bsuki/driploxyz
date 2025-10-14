const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// Ignore ephemeral SvelteKit/Vite artifacts to avoid ENOENT watcher errors
config.watchFolders = [monorepoRoot];
config.serializer = config.serializer || {};
config.serializer.getModulesRunBeforeMainModule = () => [];
config.resolver.blockList = new RegExp(
  [
    String.raw`[\\\\/]\\.svelte-kit[\\\\/]`,
    String.raw`[\\\\/]\\.vite[\\\\/]`,
    String.raw`node_modules[\\\\/]\\.vite[\\\\/]`
  ].join('|')
);

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Add support for additional file extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

module.exports = config;
