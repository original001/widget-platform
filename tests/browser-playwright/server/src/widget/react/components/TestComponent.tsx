import { observer } from "mobx-react";
import type { JSX, PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";

function TestComponentInternal({ children }: PropsWithChildren): JSX.Element {
  const [display, setDisplay] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timerRef.current = setTimeout(() => setDisplay(true), 100);
    return () => clearTimeout(timerRef.current);
  }, [timerRef, setDisplay]);

  return (
    <>
      <h3>{display ? children : "waiting..."}</h3>
    </>
  );
}

export const TestComponent = observer(({ children }: PropsWithChildren) => (
  <TestComponentInternal children={children} />
));
