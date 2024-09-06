import type { BuiltInCheckers, Config } from "@skbkontur/widget-platform";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

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
      "index.prod.html": "getProdConfig",
    },
    checkersConfig: getCheckersConfig("./playground/tsconfig.json"),
  },
  jsLoader: {
    sharedModules: {
      "@skbkontur/global-object": { type: "namespace" }, //  для работы @skbkontur/react-ui
      "focus-lock": { type: "namespace" }, //  только для работы @skbkontur/react-ui
    },
    checkersConfig: getCheckersConfig("./jsLoader/tsconfig.json"),
  },
  widget: {
    checkersConfig: getCheckersConfig("./widget/tsconfig.json"),
  },
});
