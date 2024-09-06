import { createRenderer } from "@skbkontur/loader-builder";
import { createSuccess, isFailure } from "@skbkontur/operation-result";
import { createRoot } from "react-dom/client";
import type { CreateWidgetApi } from "../.artifacts/npm-loader/internal/index.js";
import type { JsLoaderImportDependencies } from "../jsLoader/JsLoaderImportDependencies.js";
import { App } from "./App.js";

export default (async ({ dependencies }) => {
  const { account, addStyleRoot } = dependencies;

  return createSuccess({
    render: createRenderer(async ({ container, message }) => {
      const addStylesResult = await addStyleRoot(container.ownerDocument);
      if (isFailure(addStylesResult)) {
        return addStylesResult;
      }

      const root = createRoot(container);
      root.render(<App account={account} message={message} />);

      return createSuccess(async () => {
        root.unmount();
        return await addStylesResult.value.dispose();
      });
    }),
    dispose: async () => createSuccess(undefined),
  });
}) satisfies CreateWidgetApi<JsLoaderImportDependencies>;
