import type { AppUserPaths } from "./AppUserPaths.js";
import type { FullConfig } from "./FullConfig.js";
import { getArtifactPaths } from "./getArtifactPaths.js";
import { runBuild } from "./runBuild.js";

export async function build(
  artifactsDirectory: ReadonlyArray<string>,
  appUserPaths: AppUserPaths,
  fullConfig: FullConfig
): Promise<void> {
  const allArtifactPaths = getArtifactPaths(artifactsDirectory);
  await runBuild(allArtifactPaths, appUserPaths, fullConfig);
}
