/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");

const isDevelopment = !app.isPackaged;
const DEVELOPMENT_URL = "http://127.0.0.1:3000";

let mainWindow = null;
let nextServer = null;
let serverUrl = DEVELOPMENT_URL;
let isQuitting = false;

// Kept so a startup failure can show the user what the server actually said.
const serverLogLines = [];

function recordServerOutput(chunk) {
  process.stdout.write(chunk);

  for (const line of chunk.toString().split("\n")) {
    if (line.trim()) {
      serverLogLines.push(line);
    }
  }

  if (serverLogLines.length > 40) {
    serverLogLines.splice(0, serverLogLines.length - 40);
  }
}

function fail(message, detail) {
  if (isQuitting) {
    return;
  }

  isQuitting = true;
  dialog.showErrorBox(message, detail ?? "");
  app.exit(1);
}

/**
 * The bundled server runs with allowRetry disabled, so it exits rather than
 * falling back when a port is taken. Pick a free one up front instead.
 */
function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();

      server.close(() => resolve(port));
    });
  });
}

/**
 * Better Auth refuses to start in production without a secret. Generate one per
 * install rather than baking a constant into a publicly distributed binary;
 * persisting it keeps sessions valid across restarts.
 */
function readOrCreateAuthSecret(userDataDirectory) {
  const secretPath = path.join(userDataDirectory, "auth-secret");

  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, "utf8").trim();
  }

  const secret = crypto.randomBytes(32).toString("hex");

  fs.writeFileSync(secretPath, secret, { mode: 0o600 });

  return secret;
}

async function startNextServer() {
  if (isDevelopment) {
    return;
  }

  const userDataDirectory = app.getPath("userData");

  // PGlite's node filesystem uses a non-recursive mkdir, so the directory has
  // to exist before the database is opened.
  const pgliteDataDirectory = path.join(userDataDirectory, "pglite");
  fs.mkdirSync(pgliteDataDirectory, { recursive: true });

  const port = await findFreePort();
  serverUrl = `http://127.0.0.1:${port}`;

  // Never let a developer's shell credentials reach the packaged desktop app:
  // it must run against the local database, offline, with no OAuth provider.
  const inheritedEnv = { ...process.env };
  delete inheritedEnv.DATABASE_URL;
  delete inheritedEnv.GOOGLE_CLIENT_ID;
  delete inheritedEnv.GOOGLE_CLIENT_SECRET;

  const serverPath = path.join(process.resourcesPath, "server", "server.js");

  nextServer = spawn(process.execPath, [serverPath], {
    env: {
      ...inheritedEnv,
      ELECTRON_RUN_AS_NODE: "1",
      DB_DRIVER: "pglite",
      PGLITE_DATA_DIR: pgliteDataDirectory,
      MIGRATIONS_DIR: path.join(process.resourcesPath, "migrations"),
      BETTER_AUTH_SECRET: readOrCreateAuthSecret(userDataDirectory),
      BETTER_AUTH_URL: serverUrl,
      HOSTNAME: "127.0.0.1",
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  nextServer.stdout.on("data", recordServerOutput);
  nextServer.stderr.on("data", recordServerOutput);

  nextServer.on("error", (error) => {
    fail("The bundled server could not be started.", error.message);
  });

  nextServer.on("exit", (code, signal) => {
    nextServer = null;

    if (!isQuitting) {
      fail(
        "The bundled server stopped unexpectedly.",
        `exit=${code} signal=${signal}\n\n${serverLogLines.join("\n")}`,
      );
    }
  });
}

/**
 * Generous attempt count: a first launch has to initialise the local database
 * and seed it before the server starts answering.
 */
function waitForServer(attempts = 240) {
  return new Promise((resolve, reject) => {
    const check = (remainingAttempts) => {
      const request = http.get(serverUrl, (response) => {
        response.resume();
        resolve();
      });

      request.on("error", () => {
        if (remainingAttempts === 0) {
          reject(new Error("The bundled server did not become reachable."));
          return;
        }

        setTimeout(() => check(remainingAttempts - 1), 250);
      });
    };

    check(attempts);
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1024,
    minHeight: 720,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  await mainWindow.loadURL(serverUrl);
}

app.whenReady().then(async () => {
  try {
    await startNextServer();
    await waitForServer();
    await createWindow();
  } catch (error) {
    fail(
      "POS Inventory could not start.",
      `${error.message}\n\n${serverLogLines.join("\n")}`,
    );

    return;
  }

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  isQuitting = true;
  nextServer?.kill();
});
