import type {Fault,  WidgetApi} from "../../__mocks__/twoStepNpmLoader.js";
import { FaultType, importWidgetModule} from "../../__mocks__/twoStepNpmLoader.js";
import { createFailure, isSuccess } from "@skbkontur/operation-result";
import type {OperationResult} from "@skbkontur/operation-result";

// Плохой способ кеширования (гонки, глобальное состояние, никогда не вызывается dispose)
// Лучший способ кеширования может быть реализован в вашем приложении с помощью React.Context или mobx.
let cache: OperationResult<Fault, WidgetApi> = createFailure({type: "unexpected", message: "not loaded yet"});

export async function getModule(account: string): Promise<OperationResult<Fault, WidgetApi>> {
  if (isSuccess(cache)) {
    return cache;
  }

  cache = await importWidgetModule({
    widgetUrl: new URL(window.location.href),
    faultType: FaultType.None,
    account,
  });

  return cache;
}
