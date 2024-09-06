import type { AppUserPaths } from "./AppUserPaths.js";
import type { FullConfig } from "./FullConfig.js";
import { getArtifactPaths } from "./getArtifactPaths.js";
import { runBuild } from "./runBuild.js";
import { runPreviewServer } from "./runPreviewServer.js";

type Result = {
  readonly address: string;
  readonly dispose: () => void;
};

export async function preview(
  artifactsDirectory: ReadonlyArray<string>,
  appUserPaths: AppUserPaths,
  config: FullConfig
): Promise<Result> {
  const allArtifactPaths = getArtifactPaths(artifactsDirectory);

  await runBuild(allArtifactPaths, appUserPaths, config);

  const previewServer = runPreviewServer(allArtifactPaths.viteArtifactsPaths, config.playgroundConfig.port);

  return {
    address: previewServer.address,
    dispose: () => previewServer.dispose(),
  };
}
