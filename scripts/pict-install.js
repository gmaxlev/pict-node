const temp = require("temp");
const fsp = require("fs/promises");
const path = require("path");
const { execSync } = require("child_process");
const {
  REPOSITORY_URL,
  PICT_VERSION,
  BINARY_DIR,
  WIN_EXE_URL,
  WIN_EXE_NAME,
  BINARY_NAME,
} = require("./env.js");

/**
 * This script is used to install PICT binary
 */

temp.track();

run();

const IS_WIN = process.platform === "win32";

const BINARY_FILE_PATH = path.resolve(
  BINARY_DIR,
  IS_WIN ? WIN_EXE_NAME : BINARY_NAME
);

/**
 * For non-Windows platforms
 * Clones the PICT repository
 * Compiles the source code
 * Moves the binary to the bin directory
 */
async function loadForNonWin() {
  const tempDir = await temp.mkdir();
  console.log("Cloning PICT repository...");
  execSync(
    `git clone --branch v${PICT_VERSION} --depth 1 ${REPOSITORY_URL} ${tempDir}`
  );
  console.log("Compiling PICT source code...");
  execSync(`make -C ${tempDir}`);
  const compiledBinaryPath = path.resolve(tempDir, BINARY_NAME);
  console.log("Moving PICT binary to bin directory...");
  execSync(`mv ${compiledBinaryPath} ${BINARY_FILE_PATH}`);
}

/**
 * For Windows platforms
 * Downloads the pre-compiled binary
 * Moves the binary to the bin directory
 */
async function loadForWin() {
  console.log("Downloading PICT binary...");
  execSync(`curl "${WIN_EXE_URL}" -LJ -o "${BINARY_FILE_PATH}"`);
}

async function isBinaryExist() {
  try {
    await fsp.access(BINARY_FILE_PATH);
    return true;
  } catch (e) {
    return false;
  }
}

async function run() {
  const exist = await isBinaryExist();

  if (exist) {
    console.log("PICT binary already installed, skipping installation...");
    return;
  }

  console.log("Installing PICT binary...");

  await fsp.mkdir(BINARY_DIR, { recursive: true });

  if (IS_WIN) {
    await loadForWin();
  } else {
    await loadForNonWin();
  }

  try {
    const binaryExisted = await isBinaryExist();
    console.log(
      binaryExisted
        ? "PICT binary installed successfully"
        : "Failed to install PICT binary"
    );
  } catch (e) {
    console.log("Failed to install PICT binary");
    throw e;
  }
}
