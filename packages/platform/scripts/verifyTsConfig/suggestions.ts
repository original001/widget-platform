import ts, { type CompilerOptions } from "typescript";

interface Suggestion {
  level: "mandatory" | "recommended";
  value: string | boolean | string[];
  parsedValue?: ts.ModuleResolutionKind | ts.ModuleKind;
  reason?: string;
}

type RemoveIndexer<T> = {
  [K in keyof T as string extends K ? never : K]: T[K];
};

export type SuggestedCompilerOptions = Partial<Record<keyof RemoveIndexer<CompilerOptions>, Suggestion>>;

export const isolatedModulesSuggestion: SuggestedCompilerOptions = {
  isolatedModules: {
    level: "mandatory",
    value: true,
    reason: "esbuild limitations https://v2.vitejs.dev/guide/features.html#isolatedmodules",
  },
};

export const viteTypesSuggestion: SuggestedCompilerOptions = {
  types: { level: "recommended", value: ["vite/client"] },
};

export const domLibSuggestion: SuggestedCompilerOptions = {
  lib: { level: "recommended", value: ["ES2019", "DOM"] },
};

export const moduleBundlerSuggestion: SuggestedCompilerOptions = {
  module: {
    level: "mandatory",
    parsedValue: ts.ModuleKind.ES2020,
    value: "ES2020",
    reason: "moduleResolution bundler mode must be used with es",
  },
  moduleResolution: {
    level: "mandatory",
    parsedValue: ts.ModuleResolutionKind.Bundler,
    value: "bundler",
    reason: "to work with esm",
  },
};

export const moduleNode16Suggestion: SuggestedCompilerOptions = {
  module: {
    level: "mandatory",
    parsedValue: ts.ModuleKind.Node16,
    value: "Node16",
    reason: "moduleResolution node16 mode must be used with esnext",
  },
  moduleResolution: {
    level: "mandatory",
    parsedValue: ts.ModuleResolutionKind.Node16,
    value: "Node16",
    reason: "to work with esm",
  },
};

export const modulePreserveSuggestion: SuggestedCompilerOptions = {
  module: {
    level: "mandatory",
    parsedValue: ts.ModuleKind.Preserve,
    value: "preserve",
    reason: "moduleResolution preserve mode must be used with esnext",
  },
  moduleResolution: {
    level: "mandatory",
    parsedValue: ts.ModuleResolutionKind.Bundler,
    value: "bundler",
    reason: "to work with esm",
  },
};
