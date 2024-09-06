import { IsolationMode } from "./getIsolationMode.js";
import { WidgetType } from "./WidgetType.js";

export function getMessageFromWidget(
  isolationMode: IsolationMode,
  widgetType: WidgetType,
  message: string,
  value: string
): string {
  return `${widgetType}-${isolationMode}: [${message}, ${value}]`;
}
