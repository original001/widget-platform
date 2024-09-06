import { createSuccess, ensureSuccess, getValueOrThrow } from "@skbkontur/operation-result";
import { describe, expect, test } from "vitest";
import { createWidgetApiExportName } from "./createWidgetApiExportName.js";
import {
  importWidgetModuleFromNamespace,
  type WidgetModuleNamespace,
} from "./importers/importWidgetModuleFromNamespace.js";
import { catchWidgetApiFaults, fixWidgetApiDisposes } from "./index.js";
import type {
  AddCatchWidgetApiDisposeFaults,
  AddCatchWidgetApiInitDisposeFaults,
  AddCatchWidgetApiInitFaults,
  AddFixWidgetApiDisposesFaults,
  AddFixWidgetApiDisposesInitFaults,
  CreateWidgetApi,
  DefaultWidgetApi,
  InitWidget,
  WidgetInitResult,
} from "./index.js";

type TestDependencies = { readonly expectedDependencyMessage: string };
type ImportTestWidgetFault = never;
type TestWidgetInitDisposeFault = AddCatchWidgetApiInitDisposeFaults<never>;

type InitParams = string;
type TestWidgetApi = DefaultWidgetApi<
  AddFixWidgetApiDisposesFaults<AddCatchWidgetApiDisposeFaults<never>, TestWidgetInitDisposeFault>,
  InitWidget<
    InitParams,
    AddFixWidgetApiDisposesInitFaults<AddCatchWidgetApiInitFaults<never>>,
    WidgetInitResult<TestWidgetInitDisposeFault>
  >
>;

describe("integration", () => {
  test("dependency and params should be passed and init called", async () => {
    let dependencyPassResult: string | null = null;
    let initParamPassResult: InitParams | null = null;

    const createWidgetApi: CreateWidgetApi<TestDependencies, ImportTestWidgetFault, TestWidgetApi> = async ({
      dependencies,
    }) => {
      dependencyPassResult = dependencies.expectedDependencyMessage;
      const widgetApi = {
        init: async (params: InitParams) => {
          initParamPassResult = params;
          return createSuccess({
            dispose: async () => createSuccess(undefined),
          });
        },
        dispose: async () => createSuccess(undefined),
      };
      return createSuccess(fixWidgetApiDisposes(catchWidgetApiFaults(widgetApi)));
    };
    const expectedInitMessage = "hi, michael";
    const expectedDependencyMessage = "vasya";

    const value: WidgetModuleNamespace<TestDependencies, ImportTestWidgetFault, TestWidgetApi> = {
      [createWidgetApiExportName]: createWidgetApi,
    };
    const importResult = await importWidgetModuleFromNamespace<TestDependencies, ImportTestWidgetFault, TestWidgetApi>(
      createSuccess(value),
      "https://missing.dddd.ru/widget.js",
      { expectedDependencyMessage }
    );

    const initResult = await getValueOrThrow(importResult).init(expectedInitMessage);
    ensureSuccess(initResult);

    expect(dependencyPassResult).toBe(expectedDependencyMessage);
    expect(initParamPassResult).toBe(expectedInitMessage);
  });
});
