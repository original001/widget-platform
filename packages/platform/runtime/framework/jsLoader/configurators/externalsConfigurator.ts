import jsLoaderExternals from "/jsLoaderExternals.js";
import { createSuccess } from "@skbkontur/operation-result";
import { define } from "../define.js";
import type { IframeConfigurator } from "./IframeConfigurator.js";

const { widgetExposeExternalsWindowField } = define;

declare global {
  interface Window {
    [widgetExposeExternalsWindowField]?: Record<string, unknown>;
  }
}

export const externalsConfigurator: IframeConfigurator = async (window, signal) => {
  window[widgetExposeExternalsWindowField] = jsLoaderExternals;
  signal.addEventListener("abort", () => delete window[widgetExposeExternalsWindowField]);
  return createSuccess(undefined);
};
