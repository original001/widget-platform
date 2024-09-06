import ts from "typescript";

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (path) => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
};

export const writeDiagnosticToConsole = (diagnostic: ts.Diagnostic) =>
  console.log(ts.formatDiagnosticsWithColorAndContext([diagnostic], formatHost));
