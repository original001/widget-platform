import type { OperationResult } from "@skbkontur/operation-result";
import type { ConfigureIframeFaults } from "../../../npm-loader/framework/private.js";

export type IframeConfigurator = (
  window: Window,
  signal: AbortSignal
) => Promise<OperationResult<ConfigureIframeFaults, void>>;
