import { useList, useLocalStorageValue } from "@react-hookz/web";
import { Gapped, GlobalLoader, Input, THEME_2022, ThemeContext, Toggle } from "@skbkontur/react-ui";
import { ValidationContainer, ValidationWrapper } from "@skbkontur/react-ui-validations";
import { ErrorComponent, FaultComponent, type ShowLoader, useGlobalLoader } from "@skbkontur/widget-playground";
import { type JSX, StrictMode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { type Fault, FaultType } from "../../../widget-consumer-react-utils/examples/__mocks__/twoStepNpmLoader.js";
import { Widget } from "../Minimal/Widget.js";
import { WidgetModule } from "../Minimal/WidgetModule.js";
import { DataTids } from "./DataTids.js";
import styles from "./Playground.module.css";

type WidgetControllerProps = {
  readonly showLoader: ShowLoader;
  readonly widgetUrl: URL;
  readonly faultType: FaultType;
};

function WidgetController({ showLoader, widgetUrl, faultType }: WidgetControllerProps): JSX.Element {
  const { value: account, set: setAccount } = useLocalStorageValue("account", {
    defaultValue: "developer",
    initializeWithValue: true,
  });

  const { value: message, set: setMessage } = useLocalStorageValue("message", {
    defaultValue: "hello",
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
  const [faults, { push: addFault }] = useList<Fault>([]);

  return (
    <>
      <div className={styles.buttonContainer}>
        <ValidationContainer>
          <Gapped>
            <Input value={account} onValueChange={setAccount} placeholder="account" data-tid={DataTids.InputAccount} />
            <Toggle checked={loadModule} onValueChange={setLoadModule} data-tid={DataTids.ToggleModule}>
              Импортировать виджет
            </Toggle>
            <ValidationWrapper
              validationInfo={message ? null : { message: "Не пустое", type: "lostfocus", independent: true }}
            >
              <Input
                value={message}
                onValueChange={setMessage}
                disabled={!loadModule}
                placeholder="message"
                data-tid={DataTids.InputMessage}
              />
            </ValidationWrapper>
            <Toggle
              checked={loadWidget}
              onValueChange={setLoadWidget}
              disabled={!loadModule}
              data-tid={DataTids.ToggleRender}
            >
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
            faultType={faultType}
            account={account}
            loadWidget={loadWidget}
          >
            {(widgetApi) => (
              <Widget widgetApi={widgetApi} message={message} showLoader={showLoader} processDisposeFault={addFault} />
            )}
          </WidgetModule>
        ) : (
          <>Отображение модуля не включено</>
        )}
      </div>
    </>
  );
}

function DataLoader({ widgetUrl, faultType }: Props): JSX.Element {
  const [active, { showLoader }] = useGlobalLoader();

  return (
    <>
      <GlobalLoader active={active} />
      <StrictMode>
        <WidgetController showLoader={showLoader} widgetUrl={widgetUrl} faultType={faultType} />
      </StrictMode>
    </>
  );
}

type Props = {
  readonly widgetUrl: URL;
  readonly faultType: FaultType;
};

export function Playground(props: Props): JSX.Element {
  return (
    <ThemeContext.Provider value={THEME_2022}>
      <ErrorBoundary fallbackRender={({ error }) => <ErrorComponent error={error} />}>
        <DataLoader {...props} />
      </ErrorBoundary>
    </ThemeContext.Provider>
  );
}
