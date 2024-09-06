import { isFailure, tryExecute } from "@skbkontur/operation-result";

export type FetchMessage = {
  message: string;
  details?: unknown;
};

const createFetchMessage = (message: string, details: unknown): FetchMessage => ({
  message,
  details,
});

export async function getFetchMessage(widgetUrl: string): Promise<FetchMessage> {
  const fetchResult = await tryExecute(() => fetch(widgetUrl));
  if (isFailure(fetchResult)) {
    return createFetchMessage("Network error.", fetchResult.fault);
  }

  const response = fetchResult.value;
  if (!response.ok) {
    return { message: `Failed to load scripts. Status: ${response.status} ${response.statusText}.` };
  }

  const readJsResult = await tryExecute(() => response.text());
  return isFailure(readJsResult)
    ? createFetchMessage("Failed to read body.", readJsResult.fault)
    : createFetchMessage("Invalid module format.", readJsResult.value);
}
