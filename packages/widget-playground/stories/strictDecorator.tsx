import type { Decorator } from "@storybook/react";
import { StrictMode } from "react";

export const strictDecorator: Decorator = (Story) => (
  <StrictMode>
    <Story />
  </StrictMode>
);
