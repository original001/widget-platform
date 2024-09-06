import ts from "typescript";
import type { PreparedProgram } from "./prepareNpmLoaderProgram.js";
import { writeDiagnosticToConsole } from "./writeDiagnosticToConsole.js";

function ensureSuccess(program: ts.Program, emitResult: ts.EmitResult): void {
  const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  allDiagnostics.forEach(writeDiagnosticToConsole);

  if (emitResult.emitSkipped || allDiagnostics.length > 0) {
    throw Error("Failed to generate npm loader");
  }
}

export function buildProgram({ rootNames, options, addSystemToHost }: PreparedProgram): void {
  const host = ts.createCompilerHost(options);
  addSystemToHost(host);

  const program = ts.createProgram({
    rootNames,
    options,
    host,
  });
  const emitResult = program.emit();
  ensureSuccess(program, emitResult);
}
