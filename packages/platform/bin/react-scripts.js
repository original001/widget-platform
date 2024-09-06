#!/usr/bin/env node

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { execSync } from "child_process";
import { createRequire } from "module";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
  throw err;
});

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const knownScripts = ["build", "start", "preview", "watch", "build-npm-loader"];

const scriptIndex = args.findIndex((x) => knownScripts.some((script) => script === x));
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

if (knownScripts.includes(script)) {
  try {
    const newArgs = nodeArgs
      .concat("--loader  ts-node/esm")
      .concat("--no-warnings=ExperimentalWarning")
      .concat(require.resolve("../scripts/public/" + script + ".ts"))
      .concat(args.slice(scriptIndex + 1));
    const { execSync } = require("child_process");
    const output = execSync("node " + newArgs.join(" "), {
      stdio: "inherit",
      env: {
        ...process.env,
        TS_NODE_PROJECT: require.resolve("../tsconfig.json"),
      },
    });
    const outputText = output?.toString("utf8");
    if (outputText) {
      console.info("OUT:", outputText);
    }
    process.exit(0);
  } catch (e) {
    console.warn(e);
    console.warn(e.stdout?.toString("utf8"));
    console.warn(e.stderr?.toString("utf8"));
  }
  process.exit(1);
} else {
  console.log('Unknown script "' + script + '".');
}
