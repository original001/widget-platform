import { type JSX, useRef } from "react";
import { usePersistentCallback } from "../usePersistentCallback.js";

type Props = {
  refCallback: (container: HTMLDivElement) => VoidFunction;
};

// react@18.3 support a ref callback returning dispose VoidFunction natively.
// But we support react@16.9. So we have to emulate that ref div behaviour.
export function DivReact183Callback({ refCallback }: Props): JSX.Element {
  const disposeRef = useRef<VoidFunction | null>(null);
  const callback = usePersistentCallback(
    (container: HTMLDivElement | null) => {
      if (container) {
        disposeRef.current = refCallback(container);
      } else {
        if (disposeRef.current) {
          disposeRef.current();
        }
      }
    },
    [refCallback, disposeRef]
  );

  return <div ref={callback} />;
}
