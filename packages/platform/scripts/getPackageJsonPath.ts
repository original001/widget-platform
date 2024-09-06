import { resolve } from "path";

export const getPackageJsonPath = (path: ReadonlyArray<string>): string => resolve(...path, "package.json");
