import type { AllNpmLoaderDependencies, InternalFieldSymbol } from "../../npm-loader/framework/private.js";

export const findSymbolById = function (
  dependencies: AllNpmLoaderDependencies,
  symbolId: string
): InternalFieldSymbol | null {
  function isNpmLoaderSymbol(symbol: Symbol): symbol is InternalFieldSymbol {
    return symbol.toString().replace(/Symbol\((\w+)\)/, "$1") === symbolId;
  }

  const symbol = Object.getOwnPropertySymbols(dependencies).find(isNpmLoaderSymbol);
  return symbol === undefined ? null : symbol;
};
