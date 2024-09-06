import { define } from "./define.js";

const baseUrl = import.meta.url;
const serverUrl = new URL(define.widgetServerUrl, baseUrl);

export const combineUrl = (pathname: string): URL => new URL(pathname, serverUrl);
