import fs from "fs";
import path from "path";
import ts from "typescript";

function reportDiagnostics(diagnostics: ts.Diagnostic[]): void {
  diagnostics.forEach((diagnostic) => {
    let message = "Error";
    if (diagnostic.file && diagnostic.start) {
      let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      message += ` ${diagnostic.file.fileName} (${line + 1},${character + 1})`;
    }
    message += ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    console.log(message);
  });
}

export interface TsConfig {
  compilerOptions?: Record<string, unknown>;
  extends?: string;
  files?: string[];
  compileOnSave?: boolean;
}

type Result = {
  readonly merged: ts.ParsedCommandLine;
  readonly raw: TsConfig;
};

export function readTypeScriptConfigFile(configFileName: string): Result {
  const configFileText = fs.readFileSync(configFileName).toString();

  const { config, error } = ts.parseConfigFileTextToJson(configFileName, configFileText);
  if (!config) {
    reportDiagnostics([error!]);
    throw Error(`Failed to read tsconfig: ${configFileName}`);
  }

  const configParseResult = ts.parseJsonConfigFileContent(
    structuredClone(config),
    ts.sys,
    path.dirname(configFileName)
  );
  if (configParseResult.errors.length > 0) {
    reportDiagnostics(configParseResult.errors);
    throw Error(`Failed to parse tsconfig: ${configFileName}`);
  }

  return { merged: configParseResult, raw: config };
}
