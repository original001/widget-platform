import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { FaultType } from "../../../widget-consumer-react-utils/examples/__mocks__/twoStepNpmLoader.js";
import type { WidgetApi } from "../../../widget-consumer-react-utils/examples/__mocks__/twoStepNpmLoader.js";
import { strictDecorator } from "../../stories/strictDecorator.js";
import { Widget } from "./Widget.js";
import { WidgetModule } from "./WidgetModule.js";

const showLoaderAction = action("loader shown");
const hideLoaderAction = action("loader finished");
const processDisposeFault = action("fault");

let loaderIndex = 0;

const showLoader = () => {
  const current = ++loaderIndex;
  showLoaderAction(current);
  return () => hideLoaderAction(current);
};

const meta: Meta<typeof WidgetModule> = {
  id: "WidgetModule",
  component: WidgetModule,
  decorators: [strictDecorator],
  args: {
    widgetUrl: new URL(window.location.href),
    showLoader,
    processDisposeFault,
    children: "welcome" as any,
  },
  argTypes: {
    children: {
      mapping: new Proxy(
        {},
        {
          has() {
            return true;
          },
          get(_, message: string) {
            return (widgetApi: WidgetApi) => (
              <Widget
                widgetApi={widgetApi}
                message={message}
                showLoader={showLoader}
                processDisposeFault={processDisposeFault}
              />
            );
          },
        }
      ),
    },
  },
};

export default meta;

type Story = StoryObj<typeof WidgetModule>;

export const Render: Story = {
  args: {
    faultType: FaultType.None,
    account: "developer",
    loadWidget: true,
  },
};
