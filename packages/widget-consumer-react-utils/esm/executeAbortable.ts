type AsyncVoidFunction = (() => Promise<void> | void) | void;

export async function executeAbortable(
  signal: AbortSignal,
  generator: AsyncGenerator<AsyncVoidFunction, void, void>
): Promise<void> {
  if (signal.aborted) {
    return;
  }

  const disposers: AsyncVoidFunction[] = [];

  async function cleanup() {
    for (const disposer of disposers) {
      await disposer?.();
    }
  }

  for await (const disposer of generator) {
    disposers.unshift(disposer);

    if (signal.aborted) {
      break;
    }
  }

  if (signal.aborted) {
    await cleanup();
    return;
  }

  await new Promise((resolve) => signal.addEventListener("abort", resolve));
  await cleanup();
}
