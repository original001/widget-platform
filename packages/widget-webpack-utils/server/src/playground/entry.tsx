import { createRoot } from "react-dom/client";
import { subscribeToErrors } from "../../../../loader-builder/esm/importers/iframe/subscribeToErrors.js";
import { LoaderComponent } from "./LoaderComponent.js";

const container = document.getElementById("root");
if (!container) {
  throw Error("Container is not found");
}

function writeError(document: Document, container: HTMLElement, message: string): void {
  const textNode = document.createTextNode(`error: ${message}`);
  const brNode = document.createElement("br");
  container.appendChild(textNode);
  container.appendChild(brNode);
}

subscribeToErrors(window, (message) => writeError(document, container, message), {});

createRoot(container).render(<LoaderComponent />);
