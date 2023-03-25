import path from "path";
import url from "url";
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export const PICT_VERSION = "3.7.4";
export const REPOSITORY_URL = "https://github.com/microsoft/pict.git";

export function getBinaryDir() {
  return path.join(__dirname, "..", "bin");
}
