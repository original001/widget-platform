import ts from "typescript";
import { describe, expect, test } from "vitest";
import type { SuggestedCompilerOptions } from "../suggestions.js";
import { getSuggestedTsConfig } from "../verifyTypeScriptSetup.js";

describe("patchTsconfig", () => {
  const suggestion1: SuggestedCompilerOptions = {
    module: {
      level: "mandatory",
      parsedValue: ts.ModuleKind.ES2022,
      value: "ES2022",
    },
    isolatedModules: {
      level: "mandatory",
      value: true,
      reason: "because",
    },
    jsx: { level: "recommended", value: "react-jsx" },
  };

  const suggestion2: SuggestedCompilerOptions = {
    module: {
      level: "mandatory",
      parsedValue: ts.ModuleKind.Node16,
      value: "Node16",
    },
    types: { level: "recommended", value: ["vite"] },
  };

  const allSuggestions = {
    list: [suggestion1, suggestion2],
    default: suggestion1,
  };

  test("should change only platform's mandatory fields, when user use they own config", () => {
    const appTsConfig = {
      compilerOptions: {
        target: "ES2019",
        module: "ES2020",
      },
      include: ["types"],
    };

    const parsedCompilerOptions = {
      target: ts.ScriptTarget.ES2019,
      module: ts.ModuleKind.ES2020,
    };

    const newTsconfig = getSuggestedTsConfig(allSuggestions, appTsConfig, parsedCompilerOptions);

    expect(newTsconfig.appTsConfig).toEqual({
      compilerOptions: {
        target: "ES2019",
        module: "ES2022",
        isolatedModules: true,
        jsx: "react-jsx",
      },
      include: ["types"],
    });
  });
  test("should add only necessary fields, when user extend some config", () => {
    const appTsConfig = {
      extends: "../platform/tsconfig.json",
      files: [".platform/config.ts"],
    };

    const parsedCompilerOptions = {
      module: ts.ModuleKind.ES2022,
    };

    const newTsconfig = getSuggestedTsConfig(allSuggestions, appTsConfig, parsedCompilerOptions);

    expect(newTsconfig?.appTsConfig).toEqual({
      extends: "../platform/tsconfig.json",
      compilerOptions: {
        isolatedModules: true,
        jsx: "react-jsx",
      },
      files: [".platform/config.ts"],
    });
  });
  test("should not do anything, when all fields are provided by extended config", () => {
    const appTsConfig = {
      extends: "../platform/tsconfig.json",
      files: [".platform/config.ts"],
    };

    const parsedCompilerOptions = {
      module: ts.ModuleKind.ES2022,
      isolatedModules: true,
      jsx: ts.JsxEmit.ReactJSX,
    };

    const newTsconfig = getSuggestedTsConfig(allSuggestions, appTsConfig, parsedCompilerOptions);

    expect(newTsconfig?.appTsConfig).toEqual({
      extends: "../platform/tsconfig.json",
      files: [".platform/config.ts"],
    });
  });
  test("should not force bundler mode, when user choose node16 mode", () => {
    const appTsConfig = {
      compilerOptions: {
        module: "node16",
      },
    };

    const parsedCompilerOptions = {
      module: ts.ModuleKind.Node16,
    };

    const newTsconfig = getSuggestedTsConfig(allSuggestions, appTsConfig, parsedCompilerOptions);

    expect(newTsconfig.appTsConfig).toEqual({
      compilerOptions: {
        module: "node16",
        types: ["vite"],
      },
    });
  });
  test("should use first suggestion from list, when user choose nothing", () => {
    const appTsConfig = {
      compilerOptions: {},
    };

    const parsedCompilerOptions = {};

    const newTsconfig = getSuggestedTsConfig(allSuggestions, appTsConfig, parsedCompilerOptions);

    expect(newTsconfig.appTsConfig).toEqual({
      compilerOptions: {
        module: "ES2022",
        isolatedModules: true,
        jsx: "react-jsx",
      },
    });
  });
  test("should not change recommended values", () => {
    const appTsConfig = {
      compilerOptions: {
        jsx: "react",
      },
    };

    const parsedCompilerOptions = {
      jsx: ts.JsxEmit.React,
    };

    const newTsconfig = getSuggestedTsConfig(allSuggestions, appTsConfig, parsedCompilerOptions);

    expect(newTsconfig.appTsConfig).toEqual({
      compilerOptions: {
        module: "ES2022",
        isolatedModules: true,
        jsx: "react",
      },
    });
  });
});
