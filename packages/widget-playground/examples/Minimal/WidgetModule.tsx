import { Center } from "@skbkontur/react-ui";
import { usePersistentCallback } from "@skbkontur/widget-consumer-react-utils";
import { FaultComponent, type ShowLoader, useWidgetApi } from "@skbkontur/widget-playground";
import type { ReactNode } from "react";
import type {
  Fault,
  FaultType,
  WidgetApi,
} from "../../../widget-consumer-react-utils/examples/__mocks__/twoStepNpmLoader.js";
import { importWidgetModule } from "../../../widget-consumer-react-utils/examples/__mocks__/twoStepNpmLoader.js";
import { Loader } from "./Loader.js";
import type { ProcessDisposeFault } from "./ProcessDisposeFault.js";

type Props = {
  readonly processDisposeFault: ProcessDisposeFault<Fault>;
  readonly showLoader: ShowLoader;
  readonly widgetUrl: URL;
  readonly faultType: FaultType;
  readonly account: string;
  readonly loadWidget: boolean;
  readonly children: (widgetApi: WidgetApi) => ReactNode;
};

export function WidgetModule({
  processDisposeFault,
  showLoader,
  widgetUrl,
  faultType,
  account,
  loadWidget,
  children,
}: Props): ReactNode {
  const getWidgetApi = usePersistentCallback(
    () => importWidgetModule({ widgetUrl, faultType, account }),
    [widgetUrl, faultType, account]
  );

  const state = useWidgetApi(getWidgetApi, { processDisposeFault, showLoader });

  switch (state.type) {
    case "loading":
      return <Loader />;
    case "fault":
      return (
        <Center>
          <FaultComponent fault={state.fault} />
        </Center>
      );
    case "success":
      return loadWidget ? children(state.widgetApi) : <>Отображение виджета не включено</>;
  }
}
