import type { Disposable, UnexpectedFault } from "@skbkontur/loader-builder";
import type { TestExternals } from "./TestExternals.js";

export type TestDependencies = {
  readonly externals: TestExternals;
  readonly container: HTMLElement;
  readonly message: string;
};

export type ChooseExternalsFault = {
  type: "choose-externals";
  message: string;
};

export type TestWidgetModuleImportFaults = ChooseExternalsFault;
export type TestWidgetApiDisposeFaults = UnexpectedFault;
export type TestWidgetApi = Disposable<TestWidgetApiDisposeFaults>;
