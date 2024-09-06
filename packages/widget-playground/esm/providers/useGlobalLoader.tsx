import { useSet } from "@react-hookz/web";
import { usePersistentCallback } from "@skbkontur/widget-consumer-react-utils";
import { useDeferredValue, version } from "react";

const useDeferredValueNotSupported = version.startsWith("16.") || version.startsWith("17.");

const useDeferredValueSafe = <TValue,>(value: TValue): TValue =>
  useDeferredValueNotSupported ? value : useDeferredValue(value);

export type ShowLoader = () => VoidFunction;

export function useGlobalLoader(): [active: boolean, actions: { showLoader: ShowLoader }] {
  const loaders = useSet<unknown>();
  const active = useDeferredValueSafe(loaders.size > 0);
  const showLoader = usePersistentCallback(() => {
    const loader = {};
    loaders.add(loader);
    return () => loaders.delete(loader);
  }, [loaders]);
  return [active, { showLoader }];
}
