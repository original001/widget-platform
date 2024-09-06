import type { AddressInfo } from "net";
import { defaultServiceHost } from "./defaultServiceHost.js";

export const serializeAddress = (address: AddressInfo | string | null): string => {
  if (address === null) {
    throw Error("Address was not found");
  }

  if (typeof address === "string") {
    return address;
  }
  if (address.address === "::" || address.address === "127.0.0.1" || address.address === "::1") {
    const url = new URL(`https://${defaultServiceHost}`);
    url.port = address.port.toString();
    return url.href;
  }

  return `https://${address.address}:${address.port}`;
};
