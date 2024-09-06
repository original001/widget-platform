import { useList, useLocalStorageValue } from "@react-hookz/web";
import { Gapped, Input, Toggle } from "@skbkontur/react-ui";
import { ValidationContainer, ValidationWrapper } from "@skbkontur/react-ui-validations";
import type { DisposeFaults, RenderDisposeFault } from "@skbkontur/widget-platform-template-npm-loader";
import { FaultComponent, type ShowLoader } from "@skbkontur/widget-playground";
import type { JSX } from "react";
import { Widget } from "./Widget.js";
import styles from "./WidgetController.module.css";
import { WidgetModule } from "./WidgetModule.js";

type Props = {
  readonly showLoader: ShowLoader;
  readonly widgetUrl: URL;
  readonly apiUrl: URL;
};

export function WidgetController({ showLoader, widgetUrl, apiUrl }: Props): JSX.Element {
  const { value: account, set: setAccount } = useLocalStorageValue("account", {
    defaultValue: "developer",
    initializeWithValue: true,
  });
  const { value: loadModule, set: setLoadModule } = useLocalStorageValue("load-module", {
    defaultValue: false,
    initializeWithValue: true,
  });
  const { value: loadWidget, set: setLoadWidget } = useLocalStorageValue("load-widget", {
    defaultValue: false,
    initializeWithValue: true,
  });
  const [faults, { push: addFault }] = useList<DisposeFaults | RenderDisposeFault>([]);

  return (
    <>
      <div className={styles.buttonContainer}>
        <ValidationContainer>
          <Gapped>
            <ValidationWrapper
              validationInfo={account ? null : { message: "Не пустое", type: "lostfocus", independent: true }}
            >
              <Input value={account} onValueChange={setAccount} placeholder="account" />
            </ValidationWrapper>
            <Toggle checked={loadModule} onValueChange={setLoadModule}>
              Импортировать виджет
            </Toggle>
            <Toggle checked={loadWidget} onValueChange={setLoadWidget} disabled={!loadModule}>
              Отрисовать виджет
            </Toggle>
          </Gapped>
        </ValidationContainer>
      </div>
      {faults.map((fault, index) => (
        <div key={index} className={styles.faultContainer}>
          <FaultComponent fault={fault} />
        </div>
      ))}
      <div className={styles.widgetContainer}>
        {loadModule ? (
          <WidgetModule
            processDisposeFault={addFault}
            showLoader={showLoader}
            widgetUrl={widgetUrl}
            apiUrl={apiUrl}
            account={account}
            loadWidget={loadWidget}
          >
            {(widgetApi) =>
              loadWidget ? (
                <Widget processDisposeFault={addFault} showLoader={showLoader} widgetApi={widgetApi} message="Hello" />
              ) : (
                <>Отображение виджета не включено</>
              )
            }
          </WidgetModule>
        ) : (
          <>Отображение модуля не включено</>
        )}
      </div>
    </>
  );
}
