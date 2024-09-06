import fs from "fs";
import { getPackageJsonPath } from "../../getPackageJsonPath.js";
import { readConfig } from "./readConfig.js";

// externals plugin modifies cwd
const appRootDirectory = fs.realpathSync(process.cwd());

export const readCwdData = async () => ({
  config: await readConfig(appRootDirectory),
  artifactsDirectory: [appRootDirectory, ".artifacts"],
  appUserPaths: {
    appNpmLoaderPaths: {
      appPackageJsonPath: getPackageJsonPath([appRootDirectory]),
      appUserTypesDirectory: [appRootDirectory, "exports"],
    },
    appVitePaths: {
      appPlaygroundDirectory: [appRootDirectory, "playground"],
      appJsLoaderDirectory: [appRootDirectory, "jsLoader"],
      appWidgetDirectory: [appRootDirectory, "widget"],
    },
  },
});
