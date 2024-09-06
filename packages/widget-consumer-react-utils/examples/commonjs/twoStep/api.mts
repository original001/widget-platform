import {FaultType, importWidgetModule} from "../../__mocks__/twoStepNpmLoader.js";
import type {Fault,  WidgetApi} from "../../__mocks__/twoStepNpmLoader.js";
import type {OperationResult} from "@skbkontur/operation-result";

export const getModule = async (account: string): Promise<OperationResult<Fault, WidgetApi>> =>
  await importWidgetModule({
    widgetUrl: new URL(window.location.href),
    faultType: FaultType.None,
    account,
  })
