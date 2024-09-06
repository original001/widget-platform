import { EOL } from "os";
import { getCleanModuleName } from "../../getCleanModuleName.js";

type Description = {
  moduleName: string;
  cleanModuleName: string;
};

const formatImport = ({ moduleName, cleanModuleName }: Description): string =>
  `import * as ${cleanModuleName} from "${moduleName}";`;

const formatObjectField = ({ moduleName, cleanModuleName }: Description): string =>
  `"${moduleName}": {
      value: ${cleanModuleName},
      version: "",
    },`;

export function generateDependencies(moduleNames: ReadonlyArray<string>): string {
  const withCleanModuleNames = moduleNames.map((moduleName) => ({
    moduleName,
    cleanModuleName: getCleanModuleName(moduleName),
  }));
  const imports = withCleanModuleNames.map(formatImport).join(EOL);
  const objectFields = withCleanModuleNames.map(formatObjectField).join(EOL);
  return [imports, "", "export default {", objectFields, "};"].join(EOL);
}
