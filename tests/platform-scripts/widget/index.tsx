import { createSuccess, isFailure } from "@skbkontur/operation-result";
import { ErrorComponent } from "@skbkontur/widget-playground";
import type { Mode } from "platform-scripts-npm-loader";
import { ModeType, SingleModeType } from "platform-scripts-npm-loader";
import type { JSX } from "react";
import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import type { CreateWidgetApi } from "../.artifacts/npm-loader/internal/index.js";
import type { JsLoaderImportDependencies } from "../jsLoader/JsLoaderImportDependencies.js";

const PassImportDeps = lazy(() => import("./PassImportDeps.js"));
const LoadImportMetaUrlAssets = lazy(() => import("./assets/LoadImportMetaUrlAssets.js"));
const LoadImportedAssets = lazy(() => import("./assets/LoadImportedAssets.js"));
const LoadStyleAssets = lazy(() => import("./assets/LoadStyleAssets.js"));

function map(mode: Mode): JSX.Element {
  switch (mode.type) {
    case ModeType.PassImportDeps:
      return <PassImportDeps message={mode.message} />;
    case SingleModeType.LoadImportedAssets:
      return <LoadImportedAssets />;
    case SingleModeType.LoadImportMetaUrlAssets:
      return <LoadImportMetaUrlAssets />;
    case SingleModeType.LoadStyleAssets:
      return <LoadStyleAssets />;
  }
}

export default (async ({ dependencies }) => {
  const { mode, container, addStyleRoot } = dependencies;

  const addStylesResult = await addStyleRoot(container.ownerDocument);
  if (isFailure(addStylesResult)) {
    return addStylesResult;
  }

  const root = createRoot(container);
  root.render(
    <ErrorBoundary fallbackRender={({ error }) => <ErrorComponent error={error} />}>
      <Suspense fallback={"Загрузка чанка"}>{map(mode)}</Suspense>
    </ErrorBoundary>
  );

  return createSuccess({
    async dispose() {
      root.unmount();
      return await addStylesResult.value.dispose();
    },
  });
}) satisfies CreateWidgetApi<JsLoaderImportDependencies>;
