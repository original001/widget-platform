import { type AddImportWidgetModuleFaults, importWidgetModule } from "@skbkontur/loader-builder";
import type { OperationResult } from "@skbkontur/operation-result";
import { externals } from "./TestExternals.js";
import type { TestDependencies, TestWidgetApi, TestWidgetModuleImportFaults } from "./types.js";

export const importWidgetModuleViaNpmLoader = (
  widgetUrl: URL,
  container: HTMLElement,
  message: string
): Promise<OperationResult<AddImportWidgetModuleFaults<TestWidgetModuleImportFaults>, TestWidgetApi>> =>
  importWidgetModule<TestDependencies, TestWidgetModuleImportFaults, TestWidgetApi>({
    widgetUrl,
    dependencies: { externals, container, message },
  });
