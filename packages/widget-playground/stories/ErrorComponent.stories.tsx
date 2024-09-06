import type { Meta, StoryObj } from "@storybook/react";
import { ErrorComponent } from "../esm/index.js";
import { strictDecorator } from "./strictDecorator.js";

interface ErrorConstructor {
  (message?: string, options?: { readonly cause: unknown }): Error;
}

declare var Error: ErrorConstructor;

const meta: Meta<typeof ErrorComponent> = {
  component: ErrorComponent,
  decorators: [strictDecorator],
};

export default meta;

type Story = StoryObj<typeof ErrorComponent>;

export const Simple: Story = {
  args: {
    error: (function () {
      try {
        throw TypeError("Unauthorized");
      } catch (error) {
        return error;
      }
    })(),
  },
};

export const Primitive: Story = {
  args: {
    error: (function () {
      try {
        throw "Unauthorized";
      } catch (error) {
        return error;
      }
    })(),
  },
};

export const Caused: Story = {
  args: {
    error: (function () {
      try {
        throw Error("Outer", { cause: TypeError("Inner") });
      } catch (error) {
        return error;
      }
    })(),
  },
};

export const Nothing: Story = {
  args: {
    error: null,
  },
};
