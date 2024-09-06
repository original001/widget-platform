import path, { resolve } from "path";
import type { CompilerOptions } from "typescript";
import type { TsConfig } from "../readTypeScriptConfigFile.js";
import type { SuggestedCompilerOptions } from "./suggestions.js";
import { getSuggestedTsConfig } from "./verifyTypeScriptSetup.js";

export interface Suggestions {
  list: SuggestedCompilerOptions[];
  default: SuggestedCompilerOptions;
}

interface Options {
  suggestions: Suggestions;
  entryPoint: ReadonlyArray<string>;
  extensions: ReadonlyArray<string>;
  findTsConfig: (path: string) => Promise<string | null>;
  parseTsConfig: (path: string) => {
    appTsConfig: TsConfig;
    parsedCompilerOptions: CompilerOptions;
  };
}

export type SuggestedChangesResult = Map<string, { config: TsConfig; messages: string[] }>;

export async function suggestChangesForAllConfigs(options: Options) {
  const { entryPoint, extensions, findTsConfig, parseTsConfig, suggestions } = options;

  const changesMap: SuggestedChangesResult = new Map();

  const collectChanges = (path: string, config: TsConfig, messages: string[]) => {
    changesMap.set(path, { config, messages });
  };

  let tsConfigExists = false;
  const currentEntryTsConfigDefaultPath = resolve(...entryPoint, "tsconfig.json");
  for (const extension of extensions) {
    const currentEntryTsConfigActualPath = await findTsConfig(resolve(...entryPoint, `index${extension}`));
    if (currentEntryTsConfigActualPath) {
      tsConfigExists = true;

      const { appTsConfig, parsedCompilerOptions } = parseTsConfig(currentEntryTsConfigActualPath);
      const { appTsConfig: newTsConfig, messages } = getSuggestedTsConfig(
        suggestions,
        appTsConfig,
        parsedCompilerOptions
      );

      if (messages.length === 0) {
        continue;
      }

      if (currentEntryTsConfigActualPath === currentEntryTsConfigDefaultPath) {
        collectChanges(currentEntryTsConfigActualPath, newTsConfig, messages);
        break;
      }

      const inner = {
        extends: path.relative(resolve(...entryPoint), currentEntryTsConfigActualPath).replace(/\\/g, "/"),
      };
      const { appTsConfig: newTsConfigInEntryFolder } = getSuggestedTsConfig(suggestions, inner, parsedCompilerOptions);
      collectChanges(currentEntryTsConfigDefaultPath, newTsConfigInEntryFolder, messages);
      break;
    }
  }

  if (!tsConfigExists) {
    const { appTsConfig, messages } = getSuggestedTsConfig(suggestions);
    collectChanges(currentEntryTsConfigDefaultPath, appTsConfig, messages);
  }

  return changesMap;
}
