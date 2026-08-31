/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const standaloneDirectory = path.join(root, ".next", "standalone");
const stagingDirectory = path.join(root, "desktop-build");
const serverDirectory = path.join(stagingDirectory, "server");

const PGLITE_PACKAGE = path.join("node_modules", "@electric-sql", "pglite");

// PGlite loads these at runtime by resolving paths relative to its own dist
// directory. initdb is needed because a virgin data directory is initialised by
// running initdb.wasm in a nested instance.
const REQUIRED_PGLITE_FILES = [
  "package.json",
  "dist/index.cjs",
  "dist/index.js",
  "dist/pglite.wasm",
  "dist/pglite.data",
  "dist/initdb.wasm",
  "dist/initdb.js",
];

// The standalone output omits these two.
fs.cpSync(path.join(root, "public"), path.join(standaloneDirectory, "public"), {
  recursive: true,
});
fs.cpSync(
  path.join(root, ".next", "static"),
  path.join(standaloneDirectory, ".next", "static"),
  { recursive: true },
);

/*
 * Next copies .env* into the standalone output. Those files hold the hosted
 * database connection string and the OAuth secrets, and must never be shipped
 * to end users. The desktop app receives its configuration from main.cjs.
 */
for (const entry of fs.readdirSync(standaloneDirectory)) {
  if (entry === ".env" || entry.startsWith(".env.")) {
    fs.rmSync(path.join(standaloneDirectory, entry));
    console.warn(`Removed ${entry} from the standalone output.`);
  }
}

/*
 * File tracing cannot see assets referenced by runtime URL resolution, so
 * verify them and fill in anything missing. A hard failure here is much
 * cheaper than shipping an app that cannot open its own database.
 */
const tracedPglite = path.join(standaloneDirectory, PGLITE_PACKAGE);
const sourcePglite = path.join(root, PGLITE_PACKAGE);

for (const relativePath of REQUIRED_PGLITE_FILES) {
  const target = path.join(tracedPglite, relativePath);

  if (fs.existsSync(target)) {
    continue;
  }

  const source = path.join(sourcePglite, relativePath);

  if (!fs.existsSync(source)) {
    throw new Error(`Missing PGlite asset in node_modules: ${relativePath}`);
  }

  console.warn(`File tracing missed ${relativePath}, copying it manually.`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target);
}

/*
 * Stage into desktop-build/server rather than pointing extraResources straight
 * at .next/standalone: electron-builder unconditionally drops a directory named
 * "node_modules" at the root of an extraResources copy, which would strip the
 * server's dependencies - including the PGlite wasm.
 */
fs.rmSync(stagingDirectory, { recursive: true, force: true });
fs.mkdirSync(stagingDirectory, { recursive: true });
fs.cpSync(standaloneDirectory, serverDirectory, { recursive: true });
fs.cpSync(
  path.join(root, "migrations"),
  path.join(stagingDirectory, "migrations"),
  { recursive: true },
);

if (!fs.existsSync(path.join(serverDirectory, "node_modules", "next"))) {
  throw new Error("Staged server is missing node_modules/next.");
}

if (
  !fs.existsSync(
    path.join(serverDirectory, PGLITE_PACKAGE, "dist", "pglite.wasm"),
  )
) {
  throw new Error("Staged server is missing the PGlite wasm binary.");
}

console.log("Desktop server staged at desktop-build/.");
