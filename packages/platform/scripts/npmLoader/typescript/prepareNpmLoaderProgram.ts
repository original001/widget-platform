import { createFSBackedSystem } from "@typescript/vfs";
import { readFileSync } from "node:fs";
import { resolve } from "path";
import { find } from "tsconfck";
import ts from "typescript";
import { readTypeScriptConfigFile } from "../../readTypeScriptConfigFile.js";
import { generateDependencies } from "./generateDependencies.js";

const normalizeWindowPath = (s: string): string => s.replace(/\\/g, "/");

export type PreparedProgram = {
  readonly rootNames: string[];
  readonly options: ts.CompilerOptions;
  readonly addSystemToHost: (host: ts.ModuleResolutionHost) => void;
};

export async function prepareNpmLoaderProgram(
  frameworkTemplateDirectory: ReadonlyArray<string>,
  appNpmLoaderDirectory: string,
  appUserTypesDirectory: ReadonlyArray<string>,
  externals: ReadonlyArray<string>
): Promise<PreparedProgram> {
  const resolveToTarget = (path: string): string => normalizeWindowPath(resolve(...appUserTypesDirectory, path));

  const fsMap = new Map<string, string>();

  const dependencies = generateDependencies(externals);
  fsMap.set(resolveToTarget("framework/dependencies.ts"), dependencies);

  const entries = ["framework/entry.ts", "internal/index.ts"];
  for (const fileName of [...entries, "framework/publicApi.ts", "framework/private.ts", "internal/widget.ts"]) {
    const userTypes = readFileSync(resolve(...frameworkTemplateDirectory, fileName), "utf8");
    fsMap.set(resolveToTarget(fileName), userTypes);
  }

  const userTypesDir = resolve(...appUserTypesDirectory);
  const system = createFSBackedSystem(fsMap, userTypesDir, ts);
  function addSystemToHost(host: ts.ModuleResolutionHost): void {
    host.fileExists = system.fileExists;
    host.readFile = system.readFile;
    host.directoryExists = system.directoryExists;
  }

  const tsconfigPath = await find(resolve(...appUserTypesDirectory, "tsconfig.json"));
  if (tsconfigPath === null) {
    throw Error("npm-loader tsconfig is not found");
  }

  const { merged } = readTypeScriptConfigFile(tsconfigPath);
  const { options } = merged;

  options.outDir = appNpmLoaderDirectory;
  options.rootDir = userTypesDir;

  const rootNames = entries.map(resolveToTarget);

  return { rootNames, options, addSystemToHost };
}
