import type { RenderPlayground } from "@skbkontur/widget-platform/browser";
import { ErrorComponent } from "@skbkontur/widget-playground";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import type { EnvironmentConfig } from "./EnvironmentConfig.js";
import { Renderer } from "./Renderer.js";
import { Selector } from "./Selector.js";

export default (async ({ widgetUrl, container, environmentConfig }) => {
  const root = createRoot(container);

  root.render(
    <ErrorBoundary fallbackRender={({ error }) => <ErrorComponent error={error} />}>
      <Selector config={environmentConfig}>{(mode) => <Renderer widgetUrl={widgetUrl} mode={mode} />}</Selector>
    </ErrorBoundary>
  );
}) satisfies RenderPlayground<EnvironmentConfig>;
