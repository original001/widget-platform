import { mergeTests } from "@playwright/test";
import { default as connect } from "connect";
import sirv from "sirv";
import type { AppUserPaths } from "../../scripts/AppUserPaths.js";
import { build } from "../../scripts/build.js";
import { createHttpsServer } from "../../scripts/createHttpsServer.js";
import type { FullConfig } from "../../scripts/FullConfig.js";
import { getAddress } from "../../scripts/getAddress.js";
import { getArtifactPaths } from "../../scripts/getArtifactPaths.js";
import { preview } from "../../scripts/preview.js";
import { serializeAddress } from "../../scripts/serializeAddress.js";
import { start } from "../../scripts/start.js";
import { artifactsFixture, defaultWidgetPathsFixture } from "./paths.js";

type WidgetCustomizations = {
  paths?: (p: AppUserPaths) => AppUserPaths;
  config?: (c: FullConfig) => FullConfig;
};

type ServerFixture<T> = {
  serve: (serveParams: T, customizations?: WidgetCustomizations) => Promise<{ address: string }>;
};

const defaultFullConfig: FullConfig = {
  sharedModules: [],
  playgroundConfig: {
    htmlConfigs: {
      "index.html": "getIndexHtmlConfig",
    },
    checkersConfig: {},
  },
  jsLoaderConfig: {
    sharedModules: {},
    checkersConfig: {},
  },
  widgetConfig: { checkersConfig: {} },
};

function applyCustomizations(customizations: WidgetCustomizations | undefined, appUserPaths: AppUserPaths) {
  const customizedPaths = customizations?.paths?.(appUserPaths) ?? appUserPaths;
  const config = customizations?.config?.(defaultFullConfig) ?? defaultFullConfig;
  return {
    customizedPaths,
    customizedConfig: config,
  };
}

export const devServerFixture = mergeTests(defaultWidgetPathsFixture, artifactsFixture).extend<ServerFixture<void>>({
  async serve({ appUserPaths, artifactsDirectory }, use) {
    let dispose = async () => {}; // null нельзя: https://github.com/microsoft/TypeScript/issues/9998

    await use(async (_, customizations) => {
      const { customizedConfig, customizedPaths } = applyCustomizations(customizations, appUserPaths);
      const startRes = await start(artifactsDirectory, customizedPaths, customizedConfig);
      const address = getAddress(startRes.playground);
      dispose = startRes.dispose;
      return { address: serializeAddress(address) };
    });

    await dispose();
  },
});

export const previewServerFixture = mergeTests(defaultWidgetPathsFixture, artifactsFixture).extend<ServerFixture<void>>(
  {
    async serve({ appUserPaths, artifactsDirectory }, use) {
      let dispose = () => {};

      await use(async (_, customizations) => {
        const { customizedConfig, customizedPaths } = applyCustomizations(customizations, appUserPaths);
        const previewRes = await preview(artifactsDirectory, customizedPaths, customizedConfig);
        dispose = previewRes.dispose;
        return { address: previewRes.address };
      });

      dispose();
    },
  }
);

type SirvParams = {
  widgetPath: string;
  playgroundPath: string;
};

export const sirvBuiltFixture = mergeTests(defaultWidgetPathsFixture, artifactsFixture).extend<
  ServerFixture<SirvParams>
>({
  async serve({ appUserPaths, artifactsDirectory }, use) {
    let dispose = () => {};

    await use(async ({ playgroundPath, widgetPath }, customizations) => {
      const { customizedConfig, customizedPaths } = applyCustomizations(customizations, appUserPaths);
      await build(artifactsDirectory, customizedPaths, customizedConfig);
      const allArtifactPaths = getArtifactPaths(artifactsDirectory);

      const app = connect();
      app.use(widgetPath, sirv(allArtifactPaths.viteArtifactsPaths.artifactsWidgetAndLoaderDirectory));
      app.use(playgroundPath, sirv(allArtifactPaths.viteArtifactsPaths.artifactsPlaygroundDirectory));
      const server = createHttpsServer(app, undefined);

      dispose = () => server.close();
      return {
        address: serializeAddress(server.address()),
      };
    });

    dispose();
  },
});
