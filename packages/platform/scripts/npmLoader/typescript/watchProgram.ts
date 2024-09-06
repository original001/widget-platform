import ts from "typescript";
import type { PreparedProgram } from "./prepareNpmLoaderProgram.js";
import { writeDiagnosticToConsole } from "./writeDiagnosticToConsole.js";

export function watchProgram({ rootNames, options, addSystemToHost }: PreparedProgram): () => void {
  const host = ts.createWatchCompilerHost(
    rootNames,
    options,
    ts.sys,
    ts.createEmitAndSemanticDiagnosticsBuilderProgram,
    writeDiagnosticToConsole,
    writeDiagnosticToConsole
  );
  addSystemToHost(host);

  const program = ts.createWatchProgram(host);
  return () => program.close();
}
