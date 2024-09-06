import { createFailure, createSuccess, type OperationResult } from "@skbkontur/operation-result";

export function attachHtmlElement<THTMLElement extends HTMLElement>(
  document: Document,
  element: THTMLElement
): Promise<OperationResult<unknown, THTMLElement>> {
  return new Promise((resolve) => {
    element.onload = () => resolve(createSuccess(element));
    element.onerror = (err) => resolve(createFailure(err));
    document.head.appendChild(element);
  });
}
