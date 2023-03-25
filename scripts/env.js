const path = require("path");

const PICT_VERSION = "3.7.4";

module.exports.PICT_VERSION = PICT_VERSION;
module.exports.REPOSITORY_URL = "https://github.com/microsoft/pict.git";
module.exports.BINARY_NAME = "pict";
module.exports.WIN_EXE_URL = `https://github.com/microsoft/pict/releases/download/v${PICT_VERSION}/pict.exe`;
module.exports.WIN_EXE_NAME = "pict.exe";
module.exports.BINARY_DIR = path.resolve(__dirname, "..", "bin");
