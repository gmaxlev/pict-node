const nodeResolve = require("@rollup/plugin-node-resolve");
const typescript = require("rollup-plugin-typescript2");
const dts = require("rollup-plugin-dts");
const filesize = require("rollup-plugin-filesize");
const json = require("@rollup/plugin-json");

const base = {
  external: ["temp", "tsguarder"],
  plugins: [
    typescript(),
    json(),
    nodeResolve({ extensions: [".js", ".ts"] }),
    filesize(),
  ],
};

module.exports = [
  {
    input: "./dts/index.d.ts",
    output: [{ file: "lib/index.d.ts", format: "es" }],
    plugins: [dts.default()],
  },
  {
    ...base,
    input: "./src/index.ts",
    external: [...base.external],
    output: [
      {
        file: "lib/index.js",
        format: "cjs",
      },
      {
        file: "lib/index.esm.js",
        format: "es",
      },
    ],
  },
];
