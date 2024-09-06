import chalk from "chalk";
import { find } from "tsconfck";
import { readTypeScriptConfigFile } from "../readTypeScriptConfigFile.js";
import { suggestChangesForAllConfigs, type Suggestions } from "./suggestChangesForAllConfigs.js";
import {
  domLibSuggestion,
  isolatedModulesSuggestion,
  moduleBundlerSuggestion,
  moduleNode16Suggestion,
  modulePreserveSuggestion,
  viteTypesSuggestion,
} from "./suggestions.js";
import { writeJson } from "./verifyTypeScriptSetup.js";

async function patchTsConfig(entryPoint: ReadonlyArray<string>, { default: def, list }: Suggestions): Promise<void> {
  const extensions = [".ts", ".tsx"];

  const changesMap = await suggestChangesForAllConfigs({
    suggestions: {
      default: def,
      list: [def, ...list],
    },
    entryPoint,
    extensions,
    findTsConfig: (path: string) => find(path),
    parseTsConfig: (path: string) => {
      const { merged, raw } = readTypeScriptConfigFile(path);

      return {
        appTsConfig: raw,
        parsedCompilerOptions: merged.options,
      };
    },
  });

  for (let [path, { config, messages }] of changesMap) {
    writeJson(path, config);

    if (messages.length > 0) {
      console.warn(chalk.bold("The following changes are being made to your", chalk.cyan("tsconfig.json"), "file:"));
      messages.forEach((message) => {
        console.warn("  - " + message);
      });
      console.warn();
    }
  }
}

export async function patchJsLoaderConfig(appJsLoaderDirectory: ReadonlyArray<string>): Promise<void> {
  await patchTsConfig(appJsLoaderDirectory, {
    default: {
      ...isolatedModulesSuggestion,
      ...moduleBundlerSuggestion,
    },
    list: [
      {
        ...isolatedModulesSuggestion,
        ...moduleNode16Suggestion,
      },
      {
        ...isolatedModulesSuggestion,
        ...modulePreserveSuggestion,
      },
    ],
  });
}

export async function patchAppConfig(appDirectory: ReadonlyArray<string>): Promise<void> {
  await patchTsConfig(appDirectory, {
    default: {
      ...isolatedModulesSuggestion,
      ...moduleBundlerSuggestion,
      ...viteTypesSuggestion,
    },
    list: [
      {
        ...isolatedModulesSuggestion,
        ...moduleNode16Suggestion,
        ...viteTypesSuggestion,
      },
      {
        ...isolatedModulesSuggestion,
        ...modulePreserveSuggestion,
        ...viteTypesSuggestion,
      },
    ],
  });
}

export async function patchUserTypesConfig(appUserTypesDirectory: ReadonlyArray<string>): Promise<void> {
  await patchTsConfig(appUserTypesDirectory, {
    default: {
      ...isolatedModulesSuggestion,
      ...moduleNode16Suggestion,
      ...domLibSuggestion,
    },
    list: [],
  });
}

export async function patchConfigConfig(appPlatformConfigDirectory: ReadonlyArray<string>): Promise<void> {
  await patchTsConfig(appPlatformConfigDirectory, {
    default: moduleNode16Suggestion,
    list: [],
  });
}
