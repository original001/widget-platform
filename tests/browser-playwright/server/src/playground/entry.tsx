import { createRoot } from "react-dom/client";
import { subscribeToErrors } from "../../../../../packages/loader-builder/esm/importers/iframe/subscribeToErrors.js";
import { appendData } from "../appendData.js";
import { setSharedScopeFlagToWindow } from "../getSharedScopeFlagFromWindow.js";
import { LoaderComponent } from "./LoaderComponent.js";

const hot = import.meta.webpackHot;
if (hot) {
  hot.accept();
}

const container = document.getElementById("root");
if (!container) {
  throw Error("Container is not found");
}

function writeError(document: Document, container: HTMLElement, error: string): void {
  appendData(document, container, `error: ${error}`);
}

subscribeToErrors(window, (message) => writeError(document, container, message), {});

setSharedScopeFlagToWindow(window, false);

createRoot(container).render(<LoaderComponent />);
