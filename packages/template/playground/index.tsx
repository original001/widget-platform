import type { RenderPlayground } from "@skbkontur/widget-platform/browser";
import { createRoot } from "react-dom/client";
import type { EnvironmentConfig } from "./EnvironmentConfig.js";
import { Playground } from "./Playground.js";

export default (function ({ environmentConfig, widgetUrl, container }) {
  const { apiUrl } = environmentConfig;
  const root = createRoot(container);
  root.render(<Playground apiUrl={apiUrl} widgetUrl={widgetUrl} />);
} satisfies RenderPlayground<EnvironmentConfig>);
