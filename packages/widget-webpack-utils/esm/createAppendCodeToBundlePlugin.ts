import type { BannerPlugin } from "webpack";

import webpack = require("webpack");

export function createAppendCodeToBundlePlugin(code: string, after: boolean): BannerPlugin {
  return new webpack.BannerPlugin({
    banner: code,
    entryOnly: true,
    raw: true,
    footer: after,
  });
}
