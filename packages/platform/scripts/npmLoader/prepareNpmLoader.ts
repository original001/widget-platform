import fs from "fs";
import { resolve } from "path";
import { patchUserTypesConfig } from "../verifyTsConfig/patchTsConfig.js";
import { type PreparedProgram, prepareNpmLoaderProgram } from "./typescript/prepareNpmLoaderProgram.js";

function cleanDirectory(appNpmLoaderDirectory: string): void {
  if (fs.existsSync(appNpmLoaderDirectory)) {
    fs.rmSync(appNpmLoaderDirectory, { recursive: true, force: true });
  }
  fs.mkdirSync(appNpmLoaderDirectory, { recursive: true });
}

export type UserAppNpmLoaderPaths = {
  readonly appUserTypesDirectory: ReadonlyArray<string>;
};

export async function prepareNpmLoader(
  frameworkRuntimeDirectory: ReadonlyArray<string>,
  { appUserTypesDirectory }: UserAppNpmLoaderPaths,
  artifactsNpmLoaderDirectory: ReadonlyArray<string>,
  externals: ReadonlyArray<string>
): Promise<PreparedProgram> {
  const frameworkTemplateDirectory = [...frameworkRuntimeDirectory, "npm-loader"];

  const appNpmLoaderDirectoryMerged = resolve(...artifactsNpmLoaderDirectory);
  cleanDirectory(appNpmLoaderDirectoryMerged);

  await patchUserTypesConfig(appUserTypesDirectory);
  return await prepareNpmLoaderProgram(
    frameworkTemplateDirectory,
    appNpmLoaderDirectoryMerged,
    appUserTypesDirectory,
    externals
  );
}
