import type { Meta, StoryObj } from "@storybook/react";
import { FaultComponent } from "../esm/index.js";
import { strictDecorator } from "./strictDecorator.js";

const meta: Meta<typeof FaultComponent> = {
  component: FaultComponent,
  decorators: [strictDecorator],
};

export default meta;

type Story = StoryObj<typeof FaultComponent>;

export const Simple: Story = {
  args: {
    fault: {
      type: "unexpected",
      message: "some message",
    },
  },
};

export const WithError: Story = {
  args: {
    fault: {
      type: "unexpected",
      message: "other message",
      error: TypeError("error message"),
    },
  },
};

const fault = {
  type: "aggregate",
  message: "other message",
  faults: [
    {
      type: "dispose-fault",
      message: "No containers",
    },
    {
      type: "network-fault",
      message: "Unauthorized",
    },
  ],
};
export const Aggregate: Story = {
  args: { fault },
};
