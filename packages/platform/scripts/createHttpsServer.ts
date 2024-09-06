import type { Server } from "connect";
import { readFileSync } from "fs";
import { createServer } from "https";
import { getHttpsSecureContentOptions } from "./getHttpsSecureContentOptions.js";

export function createHttpsServer(app: Server, port: number | undefined) {
  const { key, cert } = getHttpsSecureContentOptions();
  const server = createServer(
    {
      key: readFileSync(key),
      cert: readFileSync(cert),
    },
    app
  );
  server.listen(port);
  return server;
}
