import { buildNpmLoader } from "../buildNpmLoader.js";
import { getArtifactPaths } from "../getArtifactPaths.js";
import { getFrameworkPaths } from "../getFrameworkPaths.js";
import { patchNpmLoaderExternals } from "../patchNpmLoaderExternals.js";
import { readCwdData } from "./private/readCwdData.js";

const { artifactsDirectory, appUserPaths, config } = await readCwdData();

const { artifactsNpmLoaderDirectory } = getArtifactPaths(artifactsDirectory);

const npmLoaderExternals = patchNpmLoaderExternals(config.sharedModules);

const { frameworkRuntimeDirectory } = getFrameworkPaths();

await buildNpmLoader(
  artifactsNpmLoaderDirectory,
  appUserPaths.appNpmLoaderPaths,
  npmLoaderExternals,
  frameworkRuntimeDirectory
);
