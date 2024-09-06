import { basename } from "path";
import type { IndexHtmlTransformContext, Plugin } from "vite";

export interface IIndexHtmlScriptAppenderOptions {
  readonly fileName: string;
  readonly children?: string;
  readonly attrs: Record<string, string | boolean | undefined>;
}

export function indexHtmlScriptAppender({ fileName, children, attrs }: IIndexHtmlScriptAppenderOptions): Plugin {
  return {
    name: "vite-plugin-index-html-script-appender",
    transformIndexHtml: {
      order: "pre",
      handler: (html: string, ctx: IndexHtmlTransformContext) => {
        const id = basename(ctx.path);
        if (id === fileName) {
          return [{ tag: "script", attrs, children: children ?? [] }];
        }
        return html;
      },
    },
  };
}
