import { Center } from "@skbkontur/react-ui";
import { usePersistentCallback } from "@skbkontur/widget-consumer-react-utils";
import type { DisposeFaults, RenderDisposeFault, WidgetApi } from "@skbkontur/widget-platform-template-npm-loader";
import { importWidgetModule } from "@skbkontur/widget-platform-template-npm-loader";
import { FaultComponent, type ShowLoader, useWidgetApi } from "@skbkontur/widget-playground";
import type { ReactNode } from "react";
import { FormSkeleton } from "./skeleton/Form.js";

type Props = {
  readonly processDisposeFault: (fault: DisposeFaults | RenderDisposeFault) => void;
  readonly showLoader: ShowLoader;
  readonly widgetUrl: URL;
  readonly apiUrl: URL;
  readonly account: string;
  readonly loadWidget: boolean;
  readonly children: (widgetApi: WidgetApi) => ReactNode;
};

export function WidgetModule({
  processDisposeFault,
  showLoader,
  widgetUrl,
  apiUrl,
  account,
  children,
}: Props): ReactNode {
  const getWidgetApi = usePersistentCallback(
    () => importWidgetModule({ widgetUrl, apiUrl, account }),
    [widgetUrl, apiUrl, account]
  );
  const state = useWidgetApi(getWidgetApi, { processDisposeFault, showLoader });

  switch (state.type) {
    case "loading":
      return (
        <Center>
          <FormSkeleton />
        </Center>
      );
    case "fault":
      return (
        <Center>
          <FaultComponent fault={state.fault} />
        </Center>
      );
    case "success":
      return children(state.widgetApi);
  }
}
