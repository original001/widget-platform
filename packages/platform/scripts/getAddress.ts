import type { AddressInfo } from "net";
import type { ViteDevServer } from "vite";

export function getAddress(viteDevServer: ViteDevServer): AddressInfo {
  const address = viteDevServer.httpServer?.address();
  if (typeof address === "string" || address === null || address === undefined) {
    throw Error(`Unsupported widget address '${address}'`);
  }

  return address;
}
