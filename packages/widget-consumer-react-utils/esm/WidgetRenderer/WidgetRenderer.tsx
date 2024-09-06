import type { JSX, ReactNode } from "react";
import { useState } from "react";
import { usePersistentCallback } from "../usePersistentCallback.js";
import { EventType, loadingEvent, WidgetContainerManager } from "./WidgetContainerManager.js";
import type { Event, RenderWidget, StateEvent } from "./WidgetContainerManager.js";

type RenderFaultProps<TFault> = {
  readonly fault: TFault;
  readonly retryRender: VoidFunction;
};

type Props<TFault> = {
  readonly loader: ReactNode;
  readonly renderWidget: RenderWidget<TFault>;
  readonly renderFault: (props: RenderFaultProps<TFault>) => ReactNode;
};

export function WidgetRenderer<TFault>({ loader, renderWidget, renderFault }: Props<TFault>): JSX.Element {
  const [state, setState] = useState<StateEvent<TFault>>(loadingEvent);

  const dispatch = usePersistentCallback(
    (event: Event<TFault>) =>
      setState(
        event.type === EventType.Error
          ? () => {
              throw event.error;
            }
          : event
      ),
    [setState]
  );

  switch (state.type) {
    case EventType.Fault:
      return (
        <>
          {renderFault({
            retryRender: () => setState(loadingEvent),
            fault: state.fault,
          })}
        </>
      );

    case EventType.Loading:
    case EventType.Finished:
      return (
        <>
          <WidgetContainerManager renderWidget={renderWidget} dispatch={dispatch} />
          {state.type === EventType.Loading && loader}
        </>
      );
  }
}
