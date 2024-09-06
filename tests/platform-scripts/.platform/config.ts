import type { BuiltInCheckers, Config } from "@skbkontur/widget-platform";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { playgroundPort } from "./playgroundPort.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getCheckersConfig(tsconfigPath: string): BuiltInCheckers {
  return {
    typescript: {
      tsconfigPath: resolve(__dirname, "..", tsconfigPath),
    },
  };
}

export default (): Config => ({
  sharedModules: ["react", "react-dom", "react-dom/client"],
  playground: {
    htmlConfigs: {
      "index.cloud.html": "getCloudConfig",
    },
    port: playgroundPort,
    checkersConfig: getCheckersConfig("./playground/tsconfig.json"),
  },
  jsLoader: {
    sharedModules: {
      "@skbkontur/global-object": { type: "namespace" },
    },
    checkersConfig: getCheckersConfig("./jsLoader/tsconfig.json"),
  },
  widget: {
    checkersConfig: getCheckersConfig("./widget/tsconfig.json"),
  },
});
