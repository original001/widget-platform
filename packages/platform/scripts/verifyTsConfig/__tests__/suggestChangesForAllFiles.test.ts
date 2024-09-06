import { dirname, resolve } from "path";
import { ModuleKind, ModuleResolutionKind } from "typescript";
import { describe, expect, it } from "vitest";
import { suggestChangesForAllConfigs, type SuggestedChangesResult } from "../suggestChangesForAllConfigs.js";
import type { SuggestedCompilerOptions } from "../suggestions.js";

describe("suggest changes for all tsconfigs", () => {
  const extensions = [".ts", ".tsx"];
  const suggestion: SuggestedCompilerOptions = {
    module: {
      level: "mandatory",
      parsedValue: ModuleKind.ES2022,
      value: "ES2022",
    },
  };

  const allSuggestions = {
    list: [suggestion],
    default: suggestion,
  };

  const checkModuleForPath = (changesMap: SuggestedChangesResult, path: string) => {
    expect(changesMap.get(path)?.config?.compilerOptions?.["module"]).toBe(suggestion["module"]?.value);
    expect(changesMap.get(path)?.messages.length).toBe(1);
    expect(changesMap.get(path)?.messages[0]).toMatch("compilerOptions.module");
  };

  const appDirectory = ".";

  const defaultOptions = {
    extensions,
    suggestions: allSuggestions,
    appDirectory,
  };

  it("should suggest changes, if there are  entry point do not meet requirements", async () => {
    const entryPoint = ["playground"];

    const changesMap = await suggestChangesForAllConfigs({
      ...defaultOptions,
      entryPoint,
      findTsConfig: (entry: string) => Promise.resolve(resolve(dirname(entry), "tsconfig.json")),
      parseTsConfig: (_path: string) => ({ appTsConfig: {}, parsedCompilerOptions: {} }),
    });

    expect(changesMap.size).toBe(1);

    checkModuleForPath(changesMap, resolve("playground", "tsconfig.json"));
  });
  it("should suggest to create new tsconfig in the entry's folder, if there is no tsconfig for entry point", async () => {
    const entryPoint = ["src"];

    const changesMap = await suggestChangesForAllConfigs({
      ...defaultOptions,
      entryPoint,
      findTsConfig: (_entry: string) => Promise.resolve(null),
      parseTsConfig: (_path: string) => ({ appTsConfig: {}, parsedCompilerOptions: {} }),
    });

    expect(changesMap.size).toBe(1);
    checkModuleForPath(changesMap, resolve("src", "tsconfig.json"));
  });
  it("should create tsconfig in the entry's folder with extends, if tsconfig was found in app directory and it doesn't meet requirements", async () => {
    const entryPoint = [appDirectory, "src"];

    const changesMap = await suggestChangesForAllConfigs({
      ...defaultOptions,
      entryPoint,
      findTsConfig: (_entry: string) => Promise.resolve(resolve(appDirectory, "tsconfig.json")),
      parseTsConfig: (_path: string) => ({
        appTsConfig: { compilerOptions: { module: "ES2020" } },
        parsedCompilerOptions: { module: ModuleKind.ES2020 },
      }),
    });

    expect(changesMap.size).toBe(1);
    expect(changesMap.get(resolve(...entryPoint, "tsconfig.json"))?.config?.extends).toBe("../tsconfig.json");
    checkModuleForPath(changesMap, resolve(...entryPoint, "tsconfig.json"));
  });
  it("should not duplicate fields from extended tsconfig", async () => {
    const entryPoint = ["src"];
    const twoSuggestions: SuggestedCompilerOptions = {
      ...suggestion,
      moduleResolution: {
        level: "mandatory",
        value: "bundler",
        parsedValue: ModuleResolutionKind.Bundler,
      },
    };

    const changesMap = await suggestChangesForAllConfigs({
      ...defaultOptions,
      suggestions: { list: [twoSuggestions], default: twoSuggestions },
      entryPoint,
      findTsConfig: (_entry: string) => Promise.resolve("tsconfig.json"),
      parseTsConfig: (_path: string) => ({
        appTsConfig: { compilerOptions: { moduleResolution: "bundler" } },
        parsedCompilerOptions: { moduleResolution: ModuleResolutionKind.Bundler },
      }),
    });

    expect(changesMap.get(resolve("src", "tsconfig.json"))?.config?.compilerOptions?.["moduleResolution"]).toBe(
      undefined
    );
    checkModuleForPath(changesMap, resolve("src", "tsconfig.json"));
  });
  it("should not create new tsconfig in the entry's folder with extends, if tsconfig was found in app directory and it meets requirements", async () => {
    const entryPoint = ["src"];

    const changesMap = await suggestChangesForAllConfigs({
      ...defaultOptions,
      entryPoint,
      findTsConfig: (_entry: string) => Promise.resolve("tsconfig.json"),
      parseTsConfig: (_path: string) => ({
        appTsConfig: { compilerOptions: { module: "ES2022" } },
        parsedCompilerOptions: { module: ModuleKind.ES2022 },
      }),
    });

    expect(changesMap.size).toBe(0);
  });
});
