import { createSuccess } from "@skbkontur/operation-result";
import { combineUrl } from "../combineUrl.js";
import { define } from "../define.js";
import type { IframeConfigurator } from "./IframeConfigurator.js";

export const preloadConfigurator: IframeConfigurator = async ({ document }, signal) => {
  const links = define.widgetBundle.preload.map((module) => {
    const link = document.createElement("link");
    link.rel = "modulepreload";
    link.href = combineUrl(module).href;
    return link;
  });

  for (const link of links) {
    document.head.appendChild(link);
  }

  signal.addEventListener("abort", () => links.forEach((link) => document.head.removeChild(link)));
  return createSuccess(undefined);
};
