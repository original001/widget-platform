import { fixWidgetApiDisposes, importWidgetModule } from "@skbkontur/loader-builder";
import type {
  AddFixWidgetApiDisposesFaults,
  AddFixWidgetApiDisposesInitFaults,
  AddImportWidgetModuleFaults,
  DefaultWidgetApi,
  InitWidget,
} from "@skbkontur/loader-builder";
import { createSuccess, isSuccess, type OperationResult } from "@skbkontur/operation-result";
import type {
  TestWidgetApiViaIFrameDisposeFaults,
  TestWidgetApiWithIframe,
  TestWidgetModuleImportViaIframeFaults,
} from "../jsLoader/entry.js";
import type { TestDependencies } from "./TestDependencies.js";
import { externals } from "./TestExternals.js";
import type { TestWidgetInitParams } from "./TestWidgetInitParams.js";
import type {
  ChooseExternalsFault,
  TestWidgetApiInitDisposeFaults,
  TestWidgetApiInitFaults,
  TestWidgetApiInitResult,
} from "./types.js";

export type TestWidgetInit = InitWidget<
  TestWidgetInitParams,
  AddFixWidgetApiDisposesInitFaults<TestWidgetApiInitFaults>,
  TestWidgetApiInitResult
>;
export type TestWidgetApi = DefaultWidgetApi<
  | AddFixWidgetApiDisposesFaults<TestWidgetApiViaIFrameDisposeFaults, TestWidgetApiInitDisposeFaults>
  | ChooseExternalsFault,
  TestWidgetInit
>;

export async function importWidgetModuleViaNpmLoader(
  widgetUrl: URL,
  moduleValue: string
): Promise<OperationResult<AddImportWidgetModuleFaults<TestWidgetModuleImportViaIframeFaults>, TestWidgetApi>> {
  const result = await importWidgetModule<
    TestDependencies,
    TestWidgetModuleImportViaIframeFaults,
    TestWidgetApiWithIframe
  >({
    widgetUrl,
    dependencies: {
      externals,
      moduleValue,
    },
  });
  return isSuccess(result) ? createSuccess(fixWidgetApiDisposes(result.value)) : result;
}
