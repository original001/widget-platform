import { normalizePath } from "vite";

export const generateViteFsPath = (path: string): string => `/@fs/${normalizePath(path)}`;
