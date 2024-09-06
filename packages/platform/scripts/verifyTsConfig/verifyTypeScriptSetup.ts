import chalk from "chalk";
import fs from "fs";
import { produce as immer } from "immer";
import os from "os";
import type { CompilerOptions } from "typescript";
import type { TsConfig } from "../readTypeScriptConfigFile.js";
import type { Suggestions } from "./suggestChangesForAllConfigs.js";
import type { SuggestedCompilerOptions } from "./suggestions.js";

export function writeJson(fileName: string, object: {}) {
  fs.writeFileSync(fileName, JSON.stringify(object, null, 2).replace(/\n/g, os.EOL) + os.EOL);
}

function findBestSuggestion(parsedCompilerOptions: CompilerOptions, allSuggestions: SuggestedCompilerOptions[]) {
  return Object.values(allSuggestions).find((suggestedCompilerOptions) =>
    Object.entries(suggestedCompilerOptions).every(([option, suggestion]) => {
      const { parsedValue, value, level } = suggestion;

      const valueToCheck = parsedValue === undefined ? value : parsedValue;
      if (
        level === "mandatory" &&
        parsedCompilerOptions[option] != null &&
        parsedCompilerOptions[option] != valueToCheck
      ) {
        return false;
      }
      return true;
    })
  );
}

export function getSuggestedTsConfig(
  suggestions: Suggestions,
  appTsConfig: TsConfig = {},
  parsedCompilerOptions: CompilerOptions = {}
) {
  const messages = [];

  const suggestedCompilerOptions = findBestSuggestion(parsedCompilerOptions, suggestions.list) ?? suggestions.default;

  for (const option of Object.keys(suggestedCompilerOptions) as (keyof typeof suggestedCompilerOptions)[]) {
    const { parsedValue, value, reason, level } = suggestedCompilerOptions[option] ?? {};

    const valueToCheck = parsedValue === undefined ? value : parsedValue;
    if (parsedCompilerOptions[option] === valueToCheck) {
      continue;
    }
    const coloredOption = chalk.cyan("compilerOptions." + option);

    const updateConfig = (value: string | boolean | undefined | string[]) => {
      appTsConfig = immer(appTsConfig, (config) => {
        if (config.compilerOptions === undefined) {
          config.compilerOptions = {
            [option]: value,
          };
        } else {
          config.compilerOptions[option] = value;
        }
      });
    };

    if (level === "recommended") {
      if (parsedCompilerOptions[option] === undefined) {
        updateConfig(value);
        messages.push(
          `${coloredOption} to be ${chalk.bold("suggested")} value: ${chalk.cyan.bold(value)} (this can be changed)`
        );
      }
    } else {
      updateConfig(value);
      messages.push(
        `${coloredOption} ${chalk.bold(valueToCheck == null ? "must not" : "must")} be ${
          valueToCheck == null ? "set" : chalk.cyan.bold(value)
        }` + (reason != null ? ` (${reason})` : "")
      );
    }
  }

  return { appTsConfig, messages };
}
