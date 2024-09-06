export function subscribeToErrors(
  contentWindow: Window,
  handleError: (message: string, error: Error) => void,
  options: AddEventListenerOptions
): void {
  contentWindow.addEventListener(
    "error",
    ({ message, filename, lineno, colno, error }) => {
      function generateError() {
        const generatedError = Error(JSON.stringify(error));
        generatedError.stack = `${filename}:${lineno}:${colno}\n`;
        return generatedError;
      }

      handleError(message, error instanceof (contentWindow as any).Error ? error : generateError());
    },
    options
  );

  contentWindow.addEventListener(
    "unhandledrejection",
    ({ reason }) => {
      if (reason instanceof (contentWindow as any).Error) {
        handleError(`Unhandled rejection. ${reason.message}`, reason);
      } else {
        const error = Error(JSON.stringify(reason));
        error.stack = "";
        handleError(`Unhandled rejection. ${reason}`, error);
      }
    },
    options
  );
}
