import { createFailure, createSuccess } from "@skbkontur/operation-result";
import { usePersistentCallback, WidgetRenderer } from "@skbkontur/widget-consumer-react-utils";
import type { JSX } from "react";

type Props = {
  readonly url: string;
};

export function Widget({ url }: Props): JSX.Element {
  const renderWidget = usePersistentCallback(async (container: HTMLElement) => {
    try {
      const response = await fetch(url);
      const body = await response.text();
      const node = document.createTextNode(body);
      container.appendChild(node);

      return createSuccess({
        dispose: () => node.remove(),
      });
    } catch (e: any) {
      return createFailure(e.message);
    }
  }, []);

  return (
    <WidgetRenderer
      loader={<>Загрузка</>}
      renderWidget={renderWidget}
      renderFault={({ fault, retryRender }) => <button onClick={retryRender}>{fault}</button>}
    />
  );
}
