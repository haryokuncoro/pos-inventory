import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // PGlite resolves pglite.wasm / pglite.data / initdb.wasm relative to its own
  // dist directory via new URL(..., import.meta.url). Bundling it breaks that
  // resolution, so it has to stay a native require. It is not on Next's default
  // externals list. Do not also add it to transpilePackages - the two lists are
  // mutually exclusive and transpiling is the failure mode being avoided here.
  serverExternalPackages: ["@electric-sql/pglite"],

  outputFileTracingIncludes: {
    "/*": [
      "node_modules/@electric-sql/pglite/dist/**/*",
      "migrations/**/*",
    ],
  },
};

export default nextConfig;
