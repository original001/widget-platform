import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { within } from "@storybook/testing-library";
import { FaultType } from "../../__mocks__/oneStepNpmLoader.js";
import { Widget } from "./Widget.js";

const meta: Meta<typeof Widget> = {
  component: Widget,
};

export default meta;

type Story = StoryObj<typeof Widget>;

export const RenderSuccess: Story = {
  args: {
    faultType: FaultType.None,
    account: "developer",
  },
  play: async ({ canvasElement }) => {
    const element = await within(canvasElement).findByText((text) => text.includes("Account: developer"), undefined, {
      timeout: 10000,
    });
    await expect(element).toBeVisible();
  },
};
