import { cpSync, writeFileSync } from "fs";
import { resolve } from "path";

const cwd = process.cwd();
const cjsFolderName = "cjs";
const cjsFolder = resolve(cwd, cjsFolderName);
cpSync(resolve(cwd, "esm"), resolve(cjsFolder, "lib"), { recursive: true });

const packageJsonFileName = "package.json";
const packageJsonFilePath = resolve(cjsFolder, packageJsonFileName);
writeFileSync(packageJsonFilePath, JSON.stringify({}), "utf-8");
cpSync(packageJsonFilePath, resolve(cwd, "dist", cjsFolderName, packageJsonFileName));
