import type { Meta, StoryObj } from "@storybook/react";
import { FaultType } from "../../../widget-consumer-react-utils/examples/__mocks__/twoStepNpmLoader.js";
import { Playground } from "./PlaygroundTwoStep.js";

const meta: Meta<typeof Playground> = {
  id: "PlaygroundTwoStep",
  component: Playground,
  args: {
    widgetUrl: new URL(window.location.href),
  },
};

export default meta;

type Story = StoryObj<typeof Playground>;

export const Render: Story = {
  args: {
    faultType: FaultType.None,
  },
};
