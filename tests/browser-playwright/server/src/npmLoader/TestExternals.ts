import * as focusLock from "focus-lock";
import * as immer from "immer";
import * as react from "react";
import * as reactDOM from "react-dom";
import * as reactDOMClient from "react-dom/client";
import * as reactJsxRuntime from "react/jsx-runtime";
import * as useSyncExternalStoreShim from "use-sync-external-store/shim/index.js";

export const externals = {
  immer,
  react,
  reactJsxRuntime,
  focusLock,
  reactDOM,
  reactDOMClient,
  useSyncExternalStoreShim,
} as const;

export type TestExternals = typeof externals;
