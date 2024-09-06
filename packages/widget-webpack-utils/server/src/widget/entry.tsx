import { type CreateWidgetApi, tryExecute } from "@skbkontur/loader-builder";
import { createSuccess } from "@skbkontur/operation-result";
import { createRoot } from "react-dom/client";
import type { TestDependencies, TestWidgetApi } from "../npmLoader/types.js";
import { AppComponent } from "./AppComponent.js";

export type CreateTestWidgetApi = CreateWidgetApi<TestDependencies, never, TestWidgetApi>;

export const createWidgetApi: CreateTestWidgetApi = async ({ dependencies }) => {
  const { message, container } = dependencies;
  const root = createRoot(container);
  root.render(<AppComponent>{message}</AppComponent>);

  return createSuccess({
    dispose: () =>
      tryExecute(async () => {
        root.unmount();
        return createSuccess(undefined);
      }),
  });
};
