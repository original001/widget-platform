import { createFailure, createSuccess } from "@skbkontur/operation-result";
import type { StyleManager } from "../../npm-loader/internal/widget.js";

function removeSingleCopyFromArray<TItem>(array: TItem[], element: TItem): void {
  const index = array.indexOf(element);
  array.splice(index, 1);
}

const baseURL = import.meta.url;

function createCSSStyleSheet(cssCode: string, constructor: typeof CSSStyleSheet): CSSStyleSheet {
  const instance = new constructor({
    baseURL,
  });
  instance.replaceSync(cssCode);
  return instance;
}

const cssCodeMap = new Map<string, string>();

type StyleRoot = Document | ShadowRoot;
type StyleData = {
  readonly constructor: typeof CSSStyleSheet;
  readonly idToCSSStyleSheetMap: Map<string, CSSStyleSheet>;
  readonly styleRoots: StyleRoot[];
};

const windows = new Map<typeof globalThis, StyleData>();
function getOrCreateStyleData(win: typeof globalThis): StyleData {
  const styleData = windows.get(win);
  if (styleData) {
    return styleData;
  }

  const { CSSStyleSheet } = win;
  const entries = [...cssCodeMap].map(([id, cssCode]) => [id, createCSSStyleSheet(cssCode, CSSStyleSheet)] as const);
  const newStyleData: StyleData = {
    constructor: CSSStyleSheet,
    idToCSSStyleSheetMap: new Map(entries),
    styleRoots: [],
  };

  windows.set(win, newStyleData);
  return newStyleData;
}

export const addStyleRoot: StyleManager = async (styleRoot) => {
  const { defaultView } = styleRoot.ownerDocument ?? styleRoot;
  if (!defaultView) {
    return createFailure({
      type: "style-manager",
      message: `Style root '${styleRoot}' doesn't have attached window`,
    });
  }

  const { idToCSSStyleSheetMap, styleRoots } = getOrCreateStyleData(defaultView);

  styleRoots.push(styleRoot);
  styleRoot.adoptedStyleSheets = [...styleRoot.adoptedStyleSheets, ...idToCSSStyleSheetMap.values()];

  return createSuccess({
    async dispose() {
      removeSingleCopyFromArray(styleRoots, styleRoot);

      const copy = [...styleRoot.adoptedStyleSheets];
      for (const sheet of idToCSSStyleSheetMap.values()) {
        removeSingleCopyFromArray(copy, sheet);
      }
      styleRoot.adoptedStyleSheets = copy;

      return createSuccess(undefined);
    },
  });
};

window.addStyle = (id, cssCode) => {
  const absoluteCssCode = cssCode.replace(
    /url\((['"]?)(.+?)\1\)/g,
    (_, quotes, url) => `url(${quotes}${new URL(url, baseURL).href}${quotes})`
  );
  cssCodeMap.set(id, absoluteCssCode);

  for (const { constructor, idToCSSStyleSheetMap, styleRoots } of windows.values()) {
    const newCSSStyleSheet = createCSSStyleSheet(absoluteCssCode, constructor);
    idToCSSStyleSheetMap.set(id, newCSSStyleSheet);

    for (const styleRoot of styleRoots) {
      // push не работает в полифиле
      styleRoot.adoptedStyleSheets = [...styleRoot.adoptedStyleSheets, newCSSStyleSheet];
    }
  }
};

window.removeStyle = (id) => {
  cssCodeMap.delete(id);

  for (const { idToCSSStyleSheetMap, styleRoots } of windows.values()) {
    const sheet = idToCSSStyleSheetMap.get(id);
    idToCSSStyleSheetMap.delete(id);

    for (const styleRoot of styleRoots) {
      styleRoot.adoptedStyleSheets = styleRoot.adoptedStyleSheets.filter((s) => s !== sheet);
    }
  }
};
