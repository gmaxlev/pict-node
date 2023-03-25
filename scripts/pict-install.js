import temp from "temp";
import { $ } from "execa";
import fsp from "fs/promises";
import { REPOSITORY_URL, PICT_VERSION, getBinaryDir } from "./env.js";

// delete temp files on exit
temp.track();

async function loadSourcesAndCompile() {
  const tempDir = await temp.mkdir();

  console.log("Created temp dir", tempDir);

  const binaryDir = getBinaryDir();

  console.log(
    `Starting to clone ${REPOSITORY_URL} v${PICT_VERSION} into ${tempDir}`
  );
  await $`git clone --branch v${PICT_VERSION} --depth 1 ${REPOSITORY_URL} ${tempDir}`;
  console.log("Cloned");
  console.log("Starting to compile");
  await $`make -C ${tempDir}`;
  console.log("Compiled");
  console.log("Starting to move to bin");
  await $`mkdir -p ${binaryDir}`;
  await $`mv ${tempDir}/pict ${binaryDir}/pict`;
  console.log("Moved to bin");
}

async function loadWinExe() {
  console.log("Downloading pict.exe");
  await $`curl -LJ https://github.com/microsoft/pict/releases/download/v3.7.4/pict.exe -o /Users/max/work/pict-node/bin/pict.exe`;
  console.log("Downloaded pict.exe");
}

async function run() {
  const list = await fsp.readdir(getBinaryDir());

  if (process.platform === "win32") {
    if (list.includes("pict.exe")) {
      console.log("pict.exe already exists");
      return;
    }
  } else {
    if (list.includes("pict")) {
      console.log("pict already exists");
      return;
    }
    return loadSourcesAndCompile();
  }
}

run();
