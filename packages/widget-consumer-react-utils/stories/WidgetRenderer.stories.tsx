import { createFailure, createSuccess } from "@skbkontur/operation-result";
import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import { type JSX, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { delay } from "../delay.js";
import { WidgetRenderer } from "../esm/WidgetRenderer/WidgetRenderer.js";

const meta: Meta<typeof WidgetRenderer> = {
  component: WidgetRenderer,
};

export default meta;

type Story = StoryObj<typeof WidgetRenderer<string>>;
type PlayContext = Parameters<NonNullable<Story["play"]>>[0];

const neverPromise = new Promise<never>(() => {});

enum DataTestIds {
  RootWidget = "widget-root",
  RootFault = "fault-root",
  RootError = "error-root",
  RootCancel = "cancel-root",
  RootDisposed = "disposed-root",
  ButtonRetry = "widget-retry-render-button",
}

const findByDataTestId = (root: HTMLElement, testId: string): Promise<HTMLElement> =>
  within(root).findByTestId(testId, undefined, { timeout: 10000 });

async function ensureComponentHaveText(canvasElement: HTMLElement, testId: DataTestIds, successfullyRendered: string) {
  const component = await findByDataTestId(canvasElement, testId);
  await expect(component).toHaveTextContent(successfullyRendered);
}

async function ensureComponentExists(canvasElement: HTMLElement, testId: DataTestIds) {
  const component = await findByDataTestId(canvasElement, testId);
  await expect(component).toBeInTheDocument();
}

async function ensureDisposed(canvasElement: HTMLElement): Promise<void> {
  await ensureComponentExists(canvasElement, DataTestIds.RootDisposed);
}

const DisposedComponent = (): JSX.Element => <div data-testid={DataTestIds.RootDisposed}>Disposed</div>;

const RetryRenderButtonComponent = ({ retry }: { retry: VoidFunction }): JSX.Element => (
  <button data-testid={DataTestIds.ButtonRetry} onClick={retry}>
    Retry
  </button>
);

async function clickRetryButton(canvasElement: HTMLElement): Promise<void> {
  const buttonRoot = await findByDataTestId(canvasElement, DataTestIds.ButtonRetry);
  await userEvent.click(buttonRoot);
}

async function ensureWidgetHaveText(canvasElement: HTMLElement, text: string): Promise<void> {
  await ensureComponentHaveText(canvasElement, DataTestIds.RootWidget, text);
}

const renderSimpleWidget = async (container: HTMLElement, text: string): Promise<VoidFunction> => {
  const preview = document.createElement("span");
  preview.innerText = "Inner loader...";
  container.appendChild(preview);

  await delay(2000);
  container.removeChild(preview);

  const node = document.createElement("span");
  node.innerText = text;
  node.setAttribute("data-testid", DataTestIds.RootWidget);
  container.appendChild(node);
  return () => container.removeChild(node);
};

const createDisposer = (dispose: VoidFunction) => createSuccess({ dispose });

async function renderWidgetAndCreateDisposer(container: HTMLDivElement, text: string) {
  const disposer = await renderSimpleWidget(container, text);
  return createDisposer(disposer);
}

const defaultArgs = {
  renderFault: ({ fault }: { readonly fault: string }) => <div data-testid={DataTestIds.RootFault}>{fault}</div>,
  loader: "Outer loader...",
};

export const RenderSuccess: Story = {
  args: {
    ...defaultArgs,
    renderWidget: (container) => renderWidgetAndCreateDisposer(container, "Successfully rendered!"),
  },
  play: ({ canvasElement }) => ensureWidgetHaveText(canvasElement, "Successfully rendered!"),
};

export const RenderFault: Story = {
  args: {
    ...defaultArgs,
    renderWidget: async () => {
      await delay(2000);
      return createFailure("I'm fault!");
    },
  },
  play: ({ canvasElement }) => ensureComponentHaveText(canvasElement, DataTestIds.RootFault, "I'm fault!"),
};

export const ThrowError: Story = {
  decorators: [
    (Story) => (
      <ErrorBoundary fallbackRender={({ error }) => <div data-testid={DataTestIds.RootError}>{error.message}</div>}>
        <Story />
      </ErrorBoundary>
    ),
  ],
  args: {
    ...defaultArgs,
    renderWidget: async () => {
      await delay(2000);
      throw Error("I'm error!");
    },
  },
  play: ({ canvasElement }) => ensureComponentHaveText(canvasElement, DataTestIds.RootError, "I'm error!"),
};

export const CancelRender = (): JSX.Element => {
  const [show, setShow] = useState(true);
  return show ? (
    <WidgetRenderer
      renderWidget={async () => {
        await delay(2000);
        setShow(false);
        return neverPromise;
      }}
      {...defaultArgs}
    />
  ) : (
    <div data-testid={DataTestIds.RootCancel}>Canceled</div>
  );
};
CancelRender.play = ({ canvasElement }: PlayContext) => ensureComponentExists(canvasElement, DataTestIds.RootCancel);

export const DisposeAfterRender = (): JSX.Element => {
  const [state, setState] = useState<"Show" | "Disposed" | "Hidden">("Show");
  switch (state) {
    case "Disposed":
      return <DisposedComponent />;
    case "Hidden":
      return <>Hidden</>;
    case "Show":
      return (
        <WidgetRenderer
          renderWidget={async (container) => {
            await renderSimpleWidget(container, "Successfully rendered");
            delay(2000).then(() => setState("Hidden"));
            return createDisposer(() => delay(2000).then(() => setState("Disposed")));
          }}
          {...defaultArgs}
        />
      );
  }
};
DisposeAfterRender.play = ({ canvasElement }: PlayContext) => ensureDisposed(canvasElement);

export const RenderAfterDisposeAfterRender = (): JSX.Element => {
  const [state, setState] = useState<"initial" | "disposed" | "final">("initial");
  return state === "disposed" ? (
    <DisposedComponent />
  ) : (
    <WidgetRenderer
      renderWidget={async (container) => {
        const dispose = await renderSimpleWidget(container, "Successfully rendered " + state);
        if (state === "initial") {
          delay(2000).then(() => setState("disposed"));
        }
        return createDisposer(() => {
          dispose();
          delay(2000).then(() => setState("final"));
        });
      }}
      {...defaultArgs}
    />
  );
};
RenderAfterDisposeAfterRender.play = async ({ canvasElement }: PlayContext) => {
  await ensureDisposed(canvasElement);
  await ensureWidgetHaveText(canvasElement, "Successfully rendered final");
};

export const RenderAfterCancel = (): JSX.Element => {
  const [state, setState] = useState<"initial" | "cancelled" | "final">("initial");
  return state === "cancelled" ? (
    <>Cancelled</>
  ) : (
    <WidgetRenderer
      renderWidget={async (container) => {
        if (state === "initial") {
          delay(2000)
            .then(() => setState("cancelled"))
            .then(() => delay(2000))
            .then(() => setState("final"));
          return neverPromise;
        }
        return await renderWidgetAndCreateDisposer(container, "Successfully rendered after cancel");
      }}
      {...defaultArgs}
    />
  );
};
RenderAfterCancel.play = ({ canvasElement }: PlayContext) =>
  ensureWidgetHaveText(canvasElement, "Successfully rendered after cancel");

export const RetryRenderAfterFault = (): JSX.Element => {
  const shouldRenderSuccessfully = useRef<boolean>(false);

  return (
    <WidgetRenderer
      renderWidget={async (container) => {
        if (shouldRenderSuccessfully.current) {
          return await renderWidgetAndCreateDisposer(container, "Successfully rendered after fault");
        }
        await delay(2000);
        return createFailure(false);
      }}
      renderFault={({ retryRender }) => (
        <RetryRenderButtonComponent
          retry={() => {
            shouldRenderSuccessfully.current = true;
            retryRender();
          }}
        />
      )}
      loader={"Loading"}
    />
  );
};
RetryRenderAfterFault.play = async ({ canvasElement }: PlayContext) => {
  await clickRetryButton(canvasElement);
  await ensureWidgetHaveText(canvasElement, "Successfully rendered after fault");
};

export const RetryRenderAfterError = (): JSX.Element => {
  const shouldRenderSuccessfully = useRef<boolean>(false);

  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <RetryRenderButtonComponent
          retry={() => {
            shouldRenderSuccessfully.current = true;
            resetErrorBoundary();
          }}
        />
      )}
    >
      <WidgetRenderer
        renderWidget={async (container) => {
          if (shouldRenderSuccessfully.current) {
            return await renderWidgetAndCreateDisposer(container, "Successfully rendered after error");
          }
          await delay(2000);
          throw Error();
        }}
        {...defaultArgs}
      />
    </ErrorBoundary>
  );
};
RetryRenderAfterError.play = async ({ canvasElement }: PlayContext) => {
  await clickRetryButton(canvasElement);
  await ensureWidgetHaveText(canvasElement, "Successfully rendered after error");
};

export const DisposeAfterCancel = (): JSX.Element => {
  const [state, setState] = useState<"Show" | "Disposed" | "Cancelled">("Show");
  switch (state) {
    case "Disposed":
      return <DisposedComponent />;
    case "Cancelled":
      return <>Canceled</>;
    case "Show":
      return (
        <WidgetRenderer
          renderWidget={async () => {
            await delay(2000);
            setState("Cancelled");
            await delay(2000);
            return createDisposer(() => delay(2000).then(() => setState("Disposed")));
          }}
          {...defaultArgs}
        />
      );
  }
};
DisposeAfterCancel.play = ({ canvasElement }: PlayContext) => ensureDisposed(canvasElement);
