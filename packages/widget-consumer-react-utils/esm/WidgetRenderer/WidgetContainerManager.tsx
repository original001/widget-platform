import { isFailure, type OperationResult } from "@skbkontur/operation-result";
import { type JSX, useRef } from "react";
import { executeAbortable } from "../executeAbortable.js";
import { usePersistentCallback } from "../usePersistentCallback.js";
import { DivReact183Callback } from "./DivReact183Callback.js";

export enum EventType {
  Loading = "loading",
  Finished = "finished",
  Fault = "fault",
  Error = "error",
}

export const loadingEvent = { type: EventType.Loading } as const;
const finishedEvent = { type: EventType.Finished } as const;

export type StateEvent<TFault> =
  | typeof finishedEvent
  | typeof loadingEvent
  | { readonly type: EventType.Fault; readonly fault: TFault };

export type Event<TFault> = StateEvent<TFault> | { readonly type: EventType.Error; readonly error: unknown };

export type Disposable = {
  readonly dispose: () => Promise<void> | void;
};

export type RenderWidget<TFault> = (container: HTMLDivElement) => Promise<OperationResult<TFault, Disposable>>;

type Props<TFault> = {
  readonly renderWidget: RenderWidget<TFault>;
  readonly dispatch: (event: Event<TFault>) => void;
};

export function WidgetContainerManager<TFault>({ renderWidget, dispatch }: Props<TFault>): JSX.Element {
  const previousRenderLifecyclePromise = useRef(Promise.resolve());

  const refCallback = usePersistentCallback(
    (container: HTMLDivElement) => {
      dispatch(loadingEvent);
      const abortController = new AbortController();

      // Consumer can rerender on same div with new renderWidget function before dispose is finished
      const node = container.ownerDocument.createElement("div");
      container.appendChild(node);

      const previous = previousRenderLifecyclePromise.current;
      previousRenderLifecyclePromise.current = executeAbortable(
        abortController.signal,
        (async function* () {
          try {
            await previous;
            yield;
            const result = await renderWidget(node);

            if (isFailure(result)) {
              yield;
              dispatch({ type: EventType.Fault, fault: result.fault });
              return;
            }

            // https://github.com/facebook/react/issues/25675#issuecomment-1363957941
            yield () => Promise.resolve().then(result.value.dispose);
            dispatch(finishedEvent);
          } catch (error) {
            yield;
            dispatch({ type: EventType.Error, error });
          }
        })()
      );

      return () => {
        abortController.abort();
        container.removeChild(node);
      };
    },
    [renderWidget, dispatch, previousRenderLifecyclePromise]
  );

  return <DivReact183Callback refCallback={refCallback} />;
}
