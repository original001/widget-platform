import { resolve } from "path";
import url from "url";
import type { FullConfig } from "../../FullConfig.js";
import { patchConfigConfig } from "../../verifyTsConfig/patchTsConfig.js";

export async function readConfig(appRootDirectory: string): Promise<FullConfig> {
  const appPlatformConfigDirectory = [appRootDirectory, ".platform"];
  await patchConfigConfig(appPlatformConfigDirectory);

  const configFile = url.pathToFileURL(resolve(...appPlatformConfigDirectory, "config.ts"));
  const module = await import(configFile.href);
  const { sharedModules = [], playground = {}, jsLoader = {}, widget = {} } = { ...module.default() };

  return {
    sharedModules,
    playgroundConfig: {
      htmlConfigs: playground.htmlConfigs,
      checkersConfig: playground.checkersConfig ?? {},
      port: playground.port,
    },
    jsLoaderConfig: {
      checkersConfig: jsLoader.checkersConfig ?? {},
      sharedModules: jsLoader.sharedModules ?? {},
    },
    widgetConfig: {
      checkersConfig: widget.checkersConfig ?? {},
    },
  };
}
