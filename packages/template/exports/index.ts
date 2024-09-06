import type { AddCatchWidgetApiInitDisposeFaults, AddCatchWidgetApiInitFaults } from "@skbkontur/loader-builder";
import type {
  RenderDisposeFault as RenderDisposeFaultInternal,
  RenderFault as RenderFaultInternal,
} from "./private.js";

export type RenderFault = AddCatchWidgetApiInitFaults<RenderFaultInternal>;

export type RenderDisposeFault = AddCatchWidgetApiInitDisposeFaults<RenderDisposeFaultInternal>;

export type InitParams = {
  readonly container: HTMLElement;
  readonly message: string;
};
