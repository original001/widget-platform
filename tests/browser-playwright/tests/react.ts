import type { ComponentProps, JSX } from "react";

export function createReactSelectorByName(name: string): string {
  return `_react=${name}`;
}

export function createReactSelector(functionalComponent: (...args: readonly never[]) => JSX.Element): string {
  const name = functionalComponent.name;
  return createReactSelectorByName(name);
}

export function createReactSelectorWithFilter<TComponentProps extends (...args: readonly any[]) => JSX.Element>(
  functionalComponent: TComponentProps,
  key: keyof ComponentProps<TComponentProps> & string,
  value: string
): string {
  return `${createReactSelector(functionalComponent)}[${key} = "${value}"]`;
}
