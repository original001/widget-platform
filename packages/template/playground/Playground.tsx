import { GlobalLoader, THEME_2022, ThemeContext } from "@skbkontur/react-ui";
import { ErrorComponent, useGlobalLoader } from "@skbkontur/widget-playground";
import type { JSX } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { WidgetController } from "./WidgetController.js";

interface Props {
  readonly widgetUrl: URL;
  readonly apiUrl: URL;
}

function DataLoader({ widgetUrl, apiUrl }: Props): JSX.Element {
  const [active, { showLoader }] = useGlobalLoader();

  return (
    <>
      <GlobalLoader active={active} />
      <WidgetController showLoader={showLoader} widgetUrl={widgetUrl} apiUrl={apiUrl} />
    </>
  );
}

export function Playground(props: Props): JSX.Element {
  return (
    <ThemeContext.Provider value={THEME_2022}>
      <ErrorBoundary fallbackRender={({ error }) => <ErrorComponent error={error} />}>
        <DataLoader {...props} />
      </ErrorBoundary>
    </ThemeContext.Provider>
  );
}
