import type { CreateWidgetApi, DefaultWidgetApi } from "@skbkontur/loader-builder";
import { catchWidgetApiFaults } from "@skbkontur/loader-builder";
import { createSuccess } from "@skbkontur/operation-result";
import type { TestDependencies } from "../npmLoader/TestDependencies.js";
import type { TestWidgetInitParams } from "../npmLoader/TestWidgetInitParams.js";
import type {
  TestInitWidgetFunc,
  TestWidgetApiDisposeInitialFaults,
  TestWidgetModuleImportInitialFaults,
} from "../npmLoader/types.js";

export type CreateTestWidgetApiInitResult = () => Promise<void>;

export type CreateTestWidgetApi = CreateWidgetApi<
  TestDependencies,
  TestWidgetModuleImportInitialFaults,
  DefaultWidgetApi<TestWidgetApiDisposeInitialFaults, TestInitWidgetFunc>
>;

export function getCreateWidgetApi(
  render: (
    dependencies: TestDependencies,
    widgetInitParams: TestWidgetInitParams
  ) => Promise<CreateTestWidgetApiInitResult>
): CreateTestWidgetApi {
  return async ({ dependencies }) => {
    const widgetApi = {
      init: async (widgetInitParams: TestWidgetInitParams) => {
        const renderResult = await render(dependencies, widgetInitParams);
        return createSuccess({
          dispose: async () => {
            await renderResult();
            return createSuccess(undefined);
          },
        });
      },
      dispose: async () => createSuccess(undefined),
    };

    return createSuccess(catchWidgetApiFaults(widgetApi));
  };
}
