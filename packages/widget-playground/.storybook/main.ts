import type { StorybookConfig } from "@storybook/react-vite";
import { dirname, join } from "path";
import { mergeConfig } from "vite";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)", "../examples/**/*.stories.@(ts|tsx)"],
  addons: [getAbsolutePath("@storybook/addon-essentials")],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  async viteFinal(config, { configType }) {
    return mergeConfig(config, {
      build: {
        target: "es2022",
      },
    });
  },
  core: {
    disableTelemetry: true,
  },
};
export default config;
