import * as react from "react";
import * as reactDOM from "react-dom";
import * as reactDOMClient from "react-dom/client";
import * as reactJsxRuntime from "react/jsx-runtime";

export const externals = {
  react,
  reactJsxRuntime,
  reactDOM,
  reactDOMClient,
} as const;

export type TestExternals = typeof externals;
