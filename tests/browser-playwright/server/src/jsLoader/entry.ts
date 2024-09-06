import type {
  AddImportWidgetModuleViaIFrameDisposeFaults,
  AddImportWidgetModuleViaIFrameFaults,
  CreateWidgetApi,
  DefaultWidgetApi,
  WidgetGenericFault,
} from "@skbkontur/loader-builder";
import { iframeInlineScriptCspHash, importWidgetModuleViaIframe } from "@skbkontur/loader-builder";
import { createFailure, createSuccess } from "@skbkontur/operation-result";
import { getCSP, NONE } from "csp-header";
import { playgroundHost, playgroundPort } from "../../../constants.js";
import { setSharedScopeFlagToWindow } from "../getSharedScopeFlagFromWindow.js";
import type { TestDependencies } from "../npmLoader/TestDependencies.js";
import type {
  TestInitWidgetFunc,
  TestWidgetApiDisposeInitialFaults,
  TestWidgetModuleImportInitialFaults,
} from "../npmLoader/types.js";
import { iframeLoaderConcreteWidgetSearchQueryParam } from "./iframeLoaderEntryName.js";

const hot = import.meta.webpackHot;
if (hot) {
  hot.accept();
}

const enum GetTestWidgetModuleViaIFrameFaultType {
  InvalidWidgetUrl = "invalid-widget-url",
}

type ConfigureWindowFaults = never;
export type TestWidgetModuleImportViaIframeFaults =
  | AddImportWidgetModuleViaIFrameFaults<TestWidgetModuleImportInitialFaults, ConfigureWindowFaults>
  | WidgetGenericFault<GetTestWidgetModuleViaIFrameFaultType>;

type ConfigureWindowDisposeFaults = never;
export type TestWidgetApiViaIFrameDisposeFaults = AddImportWidgetModuleViaIFrameDisposeFaults<
  TestWidgetApiDisposeInitialFaults,
  ConfigureWindowDisposeFaults
>;
export type TestWidgetApiWithIframe = DefaultWidgetApi<TestWidgetApiViaIFrameDisposeFaults, TestInitWidgetFunc>;

export const createWidgetApi: CreateWidgetApi<
  TestDependencies,
  TestWidgetModuleImportViaIframeFaults,
  TestWidgetApiWithIframe
> = async ({ dependencies }) => {
  const loaderUrl = new URL(import.meta.url);

  const widgetRelativeUrl = loaderUrl.searchParams.get(iframeLoaderConcreteWidgetSearchQueryParam);
  if (!widgetRelativeUrl) {
    return createFailure({
      type: GetTestWidgetModuleViaIFrameFaultType.InvalidWidgetUrl,
      message: `'${widgetRelativeUrl}' is invalid widget URL in meta`,
    });
  }

  const widgetUrl = new URL(widgetRelativeUrl, loaderUrl);
  return await importWidgetModuleViaIframe<
    TestDependencies,
    TestWidgetModuleImportInitialFaults,
    ConfigureWindowFaults,
    ConfigureWindowDisposeFaults,
    DefaultWidgetApi<TestWidgetApiDisposeInitialFaults, TestInitWidgetFunc>
  >({
    widgetUrl,
    dependencies,
    document,
    async configureContentWindow(window) {
      setSharedScopeFlagToWindow(window, true);

      const meta = window.document.createElement("meta");
      meta.httpEquiv = "Content-Security-Policy";
      meta.content = getCSP({
        directives: {
          "connect-src": [`ws://${playgroundHost}:${playgroundPort}`, widgetUrl.origin],
          "script-src": [iframeInlineScriptCspHash, widgetUrl.origin],
          "default-src": [NONE],
        },
      });
      window.document.head.appendChild(meta);

      return createSuccess({
        dispose: async () => createSuccess(undefined),
      });
    },
  });
};
