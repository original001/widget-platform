import type {
  AddCatchWidgetApiDisposeFaults,
  AddCatchWidgetApiInitDisposeFaults,
  AddCatchWidgetApiInitFaults,
  InitWidget,
  WidgetInitResult,
} from "@skbkontur/loader-builder";
import type { TestWidgetInitParams } from "./TestWidgetInitParams.js";

export type ChooseExternalsFault = {
  type: "choose-externals";
  message: string;
};
export type TestWidgetModuleImportInitialFaults = never;
export type TestWidgetApiDisposeInitialFaults = AddCatchWidgetApiDisposeFaults<never>;

export type TestWidgetApiInitFaults = AddCatchWidgetApiInitFaults<never>;
export type TestWidgetApiInitDisposeFaults = AddCatchWidgetApiInitDisposeFaults<never>;
export type TestWidgetApiInitResult = WidgetInitResult<TestWidgetApiInitDisposeFaults>;
export type TestInitWidgetFunc = InitWidget<TestWidgetInitParams, TestWidgetApiInitFaults, TestWidgetApiInitResult>;
