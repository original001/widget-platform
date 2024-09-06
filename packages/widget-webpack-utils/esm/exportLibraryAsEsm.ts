import type { BannerPlugin } from "webpack";
import { createAppendCodeToBundlePlugin } from "./createAppendCodeToBundlePlugin.js";

type Params = { readonly libraryName: string };

export function exportLibraryAsEsm({ libraryName }: Params): BannerPlugin {
  return createAppendCodeToBundlePlugin(`export const createWidgetApi = ${libraryName}["createWidgetApi"];`, true);
}
