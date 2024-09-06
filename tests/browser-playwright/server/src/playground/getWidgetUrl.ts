import { playgroundPort } from "../../../constants.js";
import {
  iframeLoaderConcreteWidgetSearchQueryParam,
  iframeLoaderEntryName,
} from "../jsLoader/iframeLoaderEntryName.js";
import { ScriptType } from "./ScriptType.js";

export function createJsUrl(scriptType: string): string {
  return `${scriptType}.js`;
}

export function getFullLoaderUrl(loaderUrl: string): URL {
  return new URL(loaderUrl, `http://localhost:${playgroundPort}`);
}

export function getWidgetUrl(isolated: boolean, scriptType: ScriptType): URL {
  const widgetJsUrl = createJsUrl(scriptType);

  if (isolated) {
    const iframeLoaderDecoratorUrl = getFullLoaderUrl(createJsUrl(iframeLoaderEntryName));
    iframeLoaderDecoratorUrl.searchParams.set(iframeLoaderConcreteWidgetSearchQueryParam, `./${widgetJsUrl}`);
    return iframeLoaderDecoratorUrl;
  }

  return getFullLoaderUrl(widgetJsUrl);
}
