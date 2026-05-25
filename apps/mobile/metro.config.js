const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// @supabase/supabase-js 2.106.x: ESM (index.mjs) uses dynamic import() for OpenTelemetry,
// which Hermes rejects. Force the CJS build that uses require() instead.
const supabaseCjs = path.join(
  __dirname,
  "node_modules/@supabase/supabase-js/dist/index.cjs",
);

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "@supabase/supabase-js") {
    return { filePath: supabaseCjs, type: "sourceFile" };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
