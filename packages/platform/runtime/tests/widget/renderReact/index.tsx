import { createSuccess } from "@skbkontur/operation-result";
import { createRoot } from "react-dom/client";
import type { CreateWidgetApi } from "../../../npm-loader/internal/index.js";
import { messageFoTest } from "./messageFoTest.js";

const createWidgetApi: CreateWidgetApi<{}> = async () => {
  const { document } = window.parent;
  const div = document.body.appendChild(document.createElement("div"));
  const root = createRoot(div);
  root.render(<div>{messageFoTest}</div>);

  return createSuccess({
    dispose: async () => {
      root.unmount();
      return createSuccess(undefined);
    },
  });
};

export default createWidgetApi;
