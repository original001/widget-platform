import type {Fault,  WidgetApi} from "../../__mocks__/oneStepNpmLoader.js";
import { FaultType, importWidgetModule} from "../../__mocks__/oneStepNpmLoader.js";
import type {OperationResult} from "@skbkontur/operation-result";

export const getModule = async (account: string, container: HTMLElement): Promise<OperationResult<Fault, WidgetApi>> =>
  await importWidgetModule({
    widgetUrl: new URL(window.location.href),
    faultType: FaultType.None,
    account,
    container,
  })
