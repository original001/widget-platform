import { existsSync } from "fs";
import { mkdir, rename, rmdir } from "fs/promises";
import { dirname, resolve } from "path";
import { type Plugin } from "vite";

export function moveFilesToFolder(filesToMove: RegExp, destPath: ReadonlyArray<string>): Plugin<any>[] {
  return [
    {
      name: "rollup-plugin-move-files-to-folder",
      apply: "build",
      async writeBundle(ctx, bundle) {
        const outDir = ctx.dir;
        if (!outDir) throw new Error("no out dir");

        if (existsSync(resolve(...destPath))) await rmdir(resolve(...destPath), { recursive: true });

        const matchingNames = Object.keys(bundle).filter((name) => name.match(filesToMove));
        const dirs = new Set(matchingNames.map((name) => dirname(resolve(...destPath, name))));
        for (const dir of dirs) await mkdir(dir, { recursive: true });

        const renames = matchingNames.map(async (name) => {
          const from = resolve(outDir, name);
          const to = resolve(...destPath, name);
          await rename(from, to);
        });
        await Promise.all(renames);
      },
    },
  ];
}
