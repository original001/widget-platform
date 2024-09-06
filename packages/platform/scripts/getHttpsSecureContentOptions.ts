import { createRequire } from "module";

const require = createRequire(import.meta.url);

export function getHttpsSecureContentOptions() {
  return {
    cert: require.resolve("@skbkontur/https-test-certificate/pem/cert.crt"),
    key: require.resolve("@skbkontur/https-test-certificate/pem/server.key"),
  };
}
