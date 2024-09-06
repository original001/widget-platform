import type { checker } from "vite-plugin-checker";

export type BuiltInCheckers = Pick<
  Parameters<typeof checker>[0],
  "eslint" | "typescript" | "vls" | "stylelint" | "vueTsc"
>;

export type JsLoaderDependency =
  | {
      readonly type: "namespace";
    }
  | {
      readonly type: "imports";
      readonly imports: ReadonlyArray<"default" | string>;
    };

export type JsLoaderDependencies = { readonly [moduleName: string]: JsLoaderDependency };

export type PlaygroundConfig = {
  readonly port?: number;
  readonly checkersConfig: BuiltInCheckers;
  readonly htmlConfigs: Record<`${string}.html`, string>;
};

export type JsLoaderConfig = {
  readonly checkersConfig: BuiltInCheckers;
  readonly sharedModules: JsLoaderDependencies;
};

export type WidgetConfig = {
  readonly checkersConfig: BuiltInCheckers;
};

export type Config = {
  readonly playground?: Partial<PlaygroundConfig>;
  readonly jsLoader?: Partial<JsLoaderConfig>;
  readonly widget?: Partial<WidgetConfig>;
  readonly sharedModules?: ReadonlyArray<string>;
};

export const defineConfig = (configFn: () => Config) => configFn;
