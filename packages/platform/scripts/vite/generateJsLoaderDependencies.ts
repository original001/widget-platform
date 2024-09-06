import { EOL } from "os";
import type { JsLoaderDependency } from "../../lib/node/config.js";
import { getCleanModuleName } from "../getCleanModuleName.js";

type Description = {
  readonly moduleName: string;
  readonly cleanModuleName: string;
  readonly importDescription: JsLoaderDependency;
};

const getUniqueImportName = (cleanModuleName: string, importName: string): string => `${cleanModuleName}_${importName}`;

function formatImport({ moduleName, cleanModuleName, importDescription }: Description): string {
  switch (importDescription.type) {
    case "namespace":
      return `import * as ${cleanModuleName} from "${moduleName}";`;
    case "imports":
      const imports = importDescription.imports
        .map((importName) => `${importName} as ${getUniqueImportName(cleanModuleName, importName)}`)
        .join(", ");
      return `import {${imports}} from "${moduleName}";`;
  }
}

function formatObjectField({ moduleName, cleanModuleName, importDescription }: Description): string {
  switch (importDescription.type) {
    case "namespace":
      return `"${moduleName}": ${cleanModuleName},`;
    case "imports":
      const imports = importDescription.imports
        .map((importName) => `${importName}: ${getUniqueImportName(cleanModuleName, importName)}`)
        .concat("__esModule: true")
        .join(", ");
      return `"${moduleName}": { ${imports} },`;
  }
}

type JsLoaderDependencyDescription = {
  readonly moduleName: string;
  readonly importDescription: JsLoaderDependency;
};

export function generateJsLoaderDependencies(externals: ReadonlyArray<JsLoaderDependencyDescription>): string {
  const withCleanModuleNames = externals.map(({ moduleName, importDescription }) => ({
    moduleName,
    cleanModuleName: getCleanModuleName(moduleName),
    importDescription,
  }));

  const imports = withCleanModuleNames.map(formatImport).join(EOL);
  const objectFields = withCleanModuleNames.map(formatObjectField).join(EOL);
  return [imports, "", "export default {", objectFields, "};"].join(EOL);
}
