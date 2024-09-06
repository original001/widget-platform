import { useRenderCount } from "@react-hookz/web";
import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { within } from "@storybook/testing-library";
import { type JSX, useEffect, useState } from "react";
import { usePersistentCallback } from "../esm/usePersistentCallback.js";

enum DataTestIds {
  Real = "real",
  Memorized = "memorized",
}

type TestComponentProps = {
  readonly numberProvider: () => number;
  readonly dep: unknown;
};

function TestComponent({ numberProvider, dep }: TestComponentProps): JSX.Element {
  const memoizedNumberProvider = usePersistentCallback(numberProvider, [dep]);
  const renderCounter = useRenderCount();

  return (
    <>
      Render count: {renderCounter}, dep value: {dep}
      <br />
      Memoized value: <div data-testid={DataTestIds.Memorized}>{memoizedNumberProvider()}</div>
    </>
  );
}

type Props = {
  readonly depsCalculator: (n: number) => unknown;
};

function PersistentCallback({ depsCalculator }: Props): JSX.Element {
  const [current, setCurrent] = useState(100);

  useEffect(() => {
    const timeout = setTimeout(() => setCurrent(200), 500);
    return () => clearTimeout(timeout);
  }, [setCurrent]);

  return (
    <>
      <TestComponent numberProvider={() => current} dep={depsCalculator(current)} />
      <br />
      Real value: <div data-testid={DataTestIds.Real}>{current}</div>
    </>
  );
}

const meta: Meta<typeof PersistentCallback> = {
  component: PersistentCallback,
};

export default meta;

type Story = StoryObj<typeof PersistentCallback>;

async function waitFor200(canvasElement: HTMLElement) {
  const element = await within(canvasElement).findByTestId(DataTestIds.Real);
  const result = await within(element).findByText("200", undefined, { timeout: 3000 });
  await expect(result).toBeVisible();
}

export const UpdateOnDepsChange: Story = {
  args: {
    depsCalculator: (current) => current,
  },
  play: async ({ canvasElement }) => {
    await waitFor200(canvasElement);

    const element = await within(canvasElement).findByTestId(DataTestIds.Memorized);
    await expect(element).toHaveTextContent("200");
  },
};

export const DoNotUpdateWithoutDepsChange: Story = {
  args: {
    depsCalculator: () => "constant value",
  },
  play: async ({ canvasElement }) => {
    await waitFor200(canvasElement);

    const element = await within(canvasElement).findByTestId(DataTestIds.Memorized);
    await expect(element).toHaveTextContent("100");
  },
};
