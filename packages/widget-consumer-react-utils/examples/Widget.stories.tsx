import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import { baseURL } from "../constants.js";
import { Widget } from "./Widget.js";

const meta: Meta<typeof Widget> = {
  component: Widget,
};

export default meta;

type Story = StoryObj<typeof Widget>;

export const RenderSuccess: Story = {
  args: {
    url: `${baseURL}/index.json`,
  },
  play: async ({ canvasElement }) => {
    const element = await within(canvasElement).findByText((text) => text.includes('{"v":4,"entries":'));
    await expect(element).toBeVisible();
  },
};

export const RenderFailed: Story = {
  args: {
    url: `http://localhost:1`,
  },
  play: async ({ canvasElement }) => {
    const retryButton = await within(canvasElement).findByText((text) => text.includes("Failed to fetch"));
    await userEvent.click(retryButton);

    const retryButton2 = await within(canvasElement).findByText((text) => text.includes("Failed to fetch"));
    await expect(retryButton2).toBeVisible();
  },
};
