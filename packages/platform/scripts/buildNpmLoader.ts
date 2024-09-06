import { prepareNpmLoader, type UserAppNpmLoaderPaths } from "./npmLoader/prepareNpmLoader.js";
import { buildProgram } from "./npmLoader/typescript/buildProgram.js";

export async function buildNpmLoader(
  artifactsNpmLoaderDirectory: ReadonlyArray<string>,
  appNpmLoaderPaths: UserAppNpmLoaderPaths,
  npmLoaderExternals: string[],
  frameworkRuntimeDirectory: string[]
): Promise<void> {
  const preparedNpmLoaderProgram = await prepareNpmLoader(
    frameworkRuntimeDirectory,
    appNpmLoaderPaths,
    artifactsNpmLoaderDirectory,
    npmLoaderExternals
  );

  buildProgram(preparedNpmLoaderProgram);
}
