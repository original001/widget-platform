import fs from "fs";
import type { Plugin } from "vite";
import { viteExternalsPlugin } from "vite-plugin-externals";
import type { Externals } from "vite-plugin-externals/dist/src/types.js";

interface IUserOptions {
  cacheDir: string;
}

// See https://github.com/crcong/vite-plugin-externals/issues/36
export function vitePluginExternalsCustom(externals: Externals, userOptions: IUserOptions): Plugin {
  const { config, ...rest } = viteExternalsPlugin(externals, { useWindow: false });
  const { cacheDir } = userOptions;

  if (!config || typeof config !== "function") {
    throw new Error("Bad config format");
  }

  return {
    config: async (...args) => {
      const previousCwd = process.cwd();

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      let configPromise;
      try {
        process.chdir(cacheDir);
        configPromise = config(...args);
      } finally {
        // Currently original 'vite-plugin-externals' reads cwd before first await. So we can restore cwd here.
        // To prevent races (between other instances of this plugin and other async cwd readers) we must restore cwd here.
        process.chdir(previousCwd);
      }

      return await configPromise;
    },
    ...rest,
  };
}
