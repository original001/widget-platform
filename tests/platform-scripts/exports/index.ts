export enum ModeType {
  PassImportDeps = "Pass import deps",
}

export enum SingleModeType {
  LoadImportedAssets = "Load imported assets",
  LoadImportMetaUrlAssets = "Load import.meta.url assets",
  LoadStyleAssets = "Load style assets",
}

export type Mode =
  | {
      readonly type: ModeType.PassImportDeps;
      readonly message: string;
    }
  | {
      readonly type: SingleModeType;
    };
