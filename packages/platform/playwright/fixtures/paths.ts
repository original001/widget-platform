import { test } from "@playwright/test";
import { fileURLToPath } from "url";
import type { AppUserPaths } from "../../scripts/AppUserPaths.js";
import { getPackageJsonPath } from "../../scripts/getPackageJsonPath.js";

type ArtifactsFixture = {
  artifactsDirectory: ReadonlyArray<string>;
};

type DefaultWidgetPathsFixture = {
  appUserPaths: AppUserPaths;
};

export const artifactsFixture = test.extend<ArtifactsFixture>({
  async artifactsDirectory({}, use, testInfo) {
    const artifactsDirectory = [testInfo.outputDir, ".artifacts"];
    await use(artifactsDirectory);
  },
});

type TestDirsFixture = {
  testsDirectory: ReadonlyArray<string>;
  runtimeDirectory: ReadonlyArray<string>;
  frameworkRootDirectory: ReadonlyArray<string>;
};

export const testDirsFixture = test.extend<TestDirsFixture>({
  async runtimeDirectory({ frameworkRootDirectory }, use) {
    await use([...frameworkRootDirectory, "runtime"]);
  },
  async testsDirectory({ runtimeDirectory }, use) {
    await use([...runtimeDirectory, "tests"]);
  },
  async frameworkRootDirectory({}, use) {
    await use([fileURLToPath(new URL(".", import.meta.url)), "..", ".."]);
  },
});

export const defaultWidgetPathsFixture = testDirsFixture.extend<DefaultWidgetPathsFixture>({
  async appUserPaths({ testsDirectory, runtimeDirectory, frameworkRootDirectory }, use) {
    const templateDirectory = [...runtimeDirectory, "template"];

    const appUserPaths: AppUserPaths = {
      appNpmLoaderPaths: {
        appPackageJsonPath: getPackageJsonPath(frameworkRootDirectory),
        appUserTypesDirectory: [...runtimeDirectory, "npm-loader"],
      },
      appVitePaths: {
        appPlaygroundDirectory: [...testsDirectory, "playground", "renderWidget"],
        appJsLoaderDirectory: [...templateDirectory, "jsLoader"],
        appWidgetDirectory: [...testsDirectory, "widget", "renderReact"],
      },
    };

    await use(appUserPaths);
  },
});
