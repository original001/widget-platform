import type { OutputAsset, OutputChunk } from "rollup";
import type { InlineConfig, UserConfig } from "vite";
import { build, mergeConfig } from "vite";
import type { Disposer } from "./Disposer.js";
import type { JsLoaderUrlInfo } from "./JsLoaderUrlInfo.js";
import type { WidgetInfo } from "./vite/createJsLoaderViteConfig.js";
import { widgetProdVirtualDirectoryName } from "./widgetProdVirtualDirectoryName.js";

const noop: Disposer = () => Promise.resolve();

async function buildSingleConfig(
  userConfig: InlineConfig,
  outputProcessor: (output: ReadonlyArray<OutputChunk | OutputAsset>) => Promise<Disposer>
): Promise<Disposer> {
  let resolve: (v?: unknown) => void = noop;
  let reject: (e: unknown) => void = noop;
  const firstBundleReady = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  let onBundleInvalidate = noop;

  const buildResult = await build(
    mergeConfig(userConfig, {
      build: {
        rollupOptions: {
          plugins: [
            {
              name: "rollup-plugin-consume-bundle",
              async writeBundle(_, outputBundle) {
                try {
                  await onBundleInvalidate();
                  onBundleInvalidate = await outputProcessor(Object.values(outputBundle));
                } catch (e) {
                  reject(e);
                }
              },
              closeBundle: resolve,
              renderError: reject,
            },
          ],
        },
      },
    } satisfies UserConfig)
  );

  if ("on" in buildResult) {
    try {
      await firstBundleReady;
    } catch (e) {
      await buildResult.close();
      throw e;
    }

    return async () => {
      await buildResult.close();
      await onBundleInvalidate();
    };
  }

  return async () => onBundleInvalidate();
}

function getEntryChunk(single: ReadonlyArray<OutputChunk | OutputAsset>): OutputChunk {
  const entryChunk = single
    .filter((outputResult): outputResult is OutputChunk => outputResult.type === "chunk")
    .find((chunk) => chunk.isEntry);
  if (entryChunk) {
    return entryChunk;
  }

  throw Error(`Entry chunk is not found in output`);
}

export const buildAll = async (
  createPlaygroundConfig: (jsLoaderUrlInfo: JsLoaderUrlInfo) => Promise<UserConfig>,
  createJsLoaderConfig: (widgetInfo: WidgetInfo) => Promise<UserConfig>,
  widgetConfig: UserConfig
): Promise<Disposer> =>
  await buildSingleConfig(widgetConfig, async (output) => {
    const entryChunk = getEntryChunk(output);

    const makeRelativeToJsLoader = (suffix: string) => `./${suffix}`;
    const jsLoaderConfig = await createJsLoaderConfig({
      widgetServerUrl: "./", // Относительно loader.js
      widgetBundle: {
        entry: makeRelativeToJsLoader(entryChunk.fileName),
        preload: entryChunk.imports.map(makeRelativeToJsLoader),
      },
    });

    return await buildSingleConfig(jsLoaderConfig, async (output) => {
      const entryChunk = getEntryChunk(output);
      const playgroundConfig = await createPlaygroundConfig({
        suffix: entryChunk.fileName, // относительно ./widget/ плейграунда
        basePath: `./${widgetProdVirtualDirectoryName}/`, // ./widget/, относительно index.html плейграунда
      });

      return await buildSingleConfig(playgroundConfig, async () => noop);
    });
  });
