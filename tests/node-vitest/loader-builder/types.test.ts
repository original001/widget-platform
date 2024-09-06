import { importWidgetModule, importWidgetModuleViaIframe, UnexpectedFaultType } from "@skbkontur/loader-builder";
import type {
  AddImportWidgetModuleFaults,
  AddImportWidgetModuleViaIFrameFaults,
  Disposable,
  WidgetGenericFault,
} from "@skbkontur/loader-builder";
import type { OperationResult } from "@skbkontur/operation-result";
import { expectType } from "ts-expect";
import { describe, test } from "vitest";

type CustomFault = WidgetGenericFault<"custom">;
describe("types", () => {
  test("import should return correct types structurally", () => {
    type ModuleType = number;
    type Actual = Awaited<ReturnType<typeof importWidgetModule<{}, CustomFault, ModuleType>>>;

    type ExpectedFault =
      | WidgetGenericFault<"invalid-arguments" | "no-export" | "module-load-failed" | typeof UnexpectedFaultType>
      | CustomFault;

    expectType<OperationResult<ExpectedFault, ModuleType>>({} as Actual);
  });

  test("import should return correct types nominally", () => {
    type WidgetApiType = string;
    type Actual = Awaited<ReturnType<typeof importWidgetModule<{}, CustomFault, WidgetApiType>>>;

    type ExpectedResult = OperationResult<AddImportWidgetModuleFaults<CustomFault>, WidgetApiType>;

    expectType<ExpectedResult>({} as Actual);
  });

  test("import iframe should return correct types", () => {
    type DisposeFaultType = "dispose-fault";
    type ConfigureWindowFaults = WidgetGenericFault<"configure-window">;
    type ConfigureWindowDisposeFaultType = "configure-window-dispose";

    type Actual = Awaited<
      ReturnType<
        typeof importWidgetModuleViaIframe<
          {},
          CustomFault,
          ConfigureWindowFaults,
          WidgetGenericFault<ConfigureWindowDisposeFaultType>,
          Disposable<WidgetGenericFault<DisposeFaultType>>
        >
      >
    >;

    type ExpectedFault = AddImportWidgetModuleViaIFrameFaults<CustomFault, ConfigureWindowFaults>;
    type ExpectedApi = Disposable<
      WidgetGenericFault<DisposeFaultType | ConfigureWindowDisposeFaultType | "aggregate" | typeof UnexpectedFaultType>
    >;

    expectType<OperationResult<ExpectedFault, ExpectedApi>>({} as Actual);
  });
});
