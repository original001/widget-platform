import { createFailure, createSuccess, isSuccess } from "@skbkontur/operation-result";
import { attachHtmlElement } from "../attachHtmlElement.js";
import { combineUrl } from "../combineUrl.js";
import type { IframeConfigurator } from "./IframeConfigurator.js";

export const createScriptConfigurator =
  (scriptPath: string): IframeConfigurator =>
  async ({ document }, signal) => {
    const scriptElement = document.createElement("script");
    scriptElement.type = "module";
    scriptElement.src = combineUrl(scriptPath).href;

    const attachResult = await attachHtmlElement(document, scriptElement);
    if (isSuccess(attachResult)) {
      signal.addEventListener("abort", () => document.head.removeChild(scriptElement));
      return createSuccess(undefined);
    }

    return createFailure({ type: "unexpected", error: attachResult.fault, message: String(attachResult.fault) });
  };
