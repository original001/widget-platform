import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import type { Route } from "playwright-core";
import { FaultContainer } from "../server/src/playground/FaultContainer.js";
import { createJsUrl } from "../server/src/playground/getWidgetUrl.js";
import { IsolationModeCheckbox, LoaderComponent } from "../server/src/playground/LoaderComponent.js";
import { ManualDisposeButton } from "../server/src/playground/ManualDisposer.js";
import { ScriptType } from "../server/src/playground/ScriptType.js";
import { ScriptTypeSelectRadio } from "../server/src/playground/ScriptTypesComponent.js";
import { WidgetInitButton, WidgetInitInput } from "../server/src/playground/WidgetApiController.js";
import { WidgetApiLoader, WidgetModuleGetButton } from "../server/src/playground/WidgetModuleListComponent.js";
import { WidgetRenderController } from "../server/src/playground/WidgetRenderController.js";
import { IsolationMode } from "../server/src/widget/getIsolationMode.js";
import { getMessageFromWidget } from "../server/src/widget/getMessageFromWidget.js";
import { InputForModalComponent } from "../server/src/widget/react/components/modal/InputForModalComponent.js";
import { ModalInputComponent } from "../server/src/widget/react/components/modal/ModalInputComponent.js";
import { ModalLabelComponent } from "../server/src/widget/react/components/modal/ModalLabelComponent.js";
import { ModalOpenButton } from "../server/src/widget/react/components/modal/ModalOpenButton.js";
import { WidgetType } from "../server/src/widget/WidgetType.js";
import { createReactSelector, createReactSelectorByName, createReactSelectorWithFilter } from "./react.js";

async function getLoaderFromPage(page: Page): Promise<Locator> {
  await page.goto("/");
  return page.locator(createReactSelector(LoaderComponent));
}

enum TestIsolationMode {
  IFrame = "iframe isolation",
  None = "without isolation",
}

async function setCheckbox<TEnum extends string>(
  checkbox: Locator,
  type: TEnum,
  map: Record<TEnum, boolean>
): Promise<void> {
  switch (map[type]) {
    case false:
      await checkbox.uncheck();
      break;
    case true:
      await checkbox.check();
      break;
  }
}

async function getWidgetApi(
  loader: Locator,
  isolationMode: TestIsolationMode,
  scriptType: ScriptType
): Promise<Locator> {
  const isolationModeCheckbox = loader.locator(createReactSelector(IsolationModeCheckbox));
  await setCheckbox(isolationModeCheckbox, isolationMode, {
    [TestIsolationMode.None]: false,
    [TestIsolationMode.IFrame]: true,
  });

  await loader.locator(createReactSelectorWithFilter(ScriptTypeSelectRadio, "scriptType", scriptType)).check();
  await loader.locator(createReactSelector(WidgetModuleGetButton)).click();

  return loader.locator(createReactSelectorWithFilter(WidgetApiLoader, "scriptType", scriptType));
}

async function initWidget(widgetApi: Locator, value: string): Promise<Locator> {
  await widgetApi.locator(createReactSelector(WidgetInitInput)).fill(value);
  await widgetApi.locator(createReactSelector(WidgetInitButton)).click();
  return widgetApi.locator(createReactSelectorWithFilter(WidgetRenderController, "value", value));
}

const getIsolationModeCartesianProduct = <T extends object>(objects: readonly T[]) =>
  Object.values(TestIsolationMode).flatMap((isolationMode) =>
    objects.map((obj) => ({
      isolationMode,
      ...obj,
    }))
  );

const getIsolationModeScriptTypeCartesianProduct = (scriptTypes: readonly ScriptType[]) =>
  getIsolationModeCartesianProduct(scriptTypes.map((scriptType) => ({ scriptType })));

async function openModal(
  page: Page,
  isolationMode: TestIsolationMode,
  scriptType: ScriptType,
  valueForModal: string
): Promise<Locator> {
  const loader = await getLoaderFromPage(page);
  const widgetApi = await getWidgetApi(loader, isolationMode, scriptType);
  const widget = await initWidget(widgetApi, "testing modal");

  await widget.locator(createReactSelector(InputForModalComponent)).fill(valueForModal);
  await widget.locator(createReactSelector(ModalOpenButton)).click();

  return page.locator(createReactSelectorByName("Modal"));
}

const getCaseName = (isolationMode: TestIsolationMode, scriptType: ScriptType, suffix: string): string =>
  `${isolationMode}-${scriptType}-${suffix}`;

const reactWithFocusLockScriptTypes = [ScriptType.ReactExternalsWindow, ScriptType.ReactExternalsClosure] as const;

getIsolationModeScriptTypeCartesianProduct(reactWithFocusLockScriptTypes)
  .concat({ isolationMode: TestIsolationMode.None, scriptType: ScriptType.ReactDuplicate })
  .forEach(({ isolationMode, scriptType }) => {
    test(getCaseName(isolationMode, scriptType, "lock-focus"), async ({ page }) => {
      async function pressTab(): Promise<void> {
        await page.keyboard.press("Tab");
      }

      const valueForModal = "valueForModal6543";
      const modal = await openModal(page, isolationMode, scriptType, valueForModal);

      const modalInput = modal.locator(createReactSelector(ModalInputComponent));
      await modalInput.fill("unused");

      await expect(modalInput).toBeFocused();

      await pressTab();
      const closeButton = modal
        .locator(createReactSelectorByName("ModalFooter"))
        .locator(createReactSelectorByName("button"));
      await expect(closeButton).toBeFocused();

      await pressTab();
      const cross = modal.locator(createReactSelectorByName("ModalClose"));
      await expect(cross).toBeFocused();

      await pressTab();
      await expect(modalInput).toBeFocused();
    });
  });

const reactScriptTypes = [...reactWithFocusLockScriptTypes, ScriptType.ReactDuplicate] as const;

getIsolationModeScriptTypeCartesianProduct(reactScriptTypes).forEach(({ isolationMode, scriptType }) => {
  test(getCaseName(isolationMode, scriptType, "open-modal"), async ({ page }) => {
    const valueForModal = "valueForModal6543";

    const modal = await openModal(page, isolationMode, scriptType, valueForModal);

    const modalLabel = modal.locator(createReactSelector(ModalLabelComponent));
    await expect(modalLabel).toHaveText(valueForModal);
  });
});

const widgetTypeMap: Record<ScriptType, WidgetType> = {
  ...Object.fromEntries(reactScriptTypes.map((scriptType) => [scriptType, WidgetType.React] as const)),
  [ScriptType.ExplicitDependency]: WidgetType.Immer,
  [ScriptType.Plain]: WidgetType.Vanilla,
};

getIsolationModeScriptTypeCartesianProduct(Object.values(ScriptType)).forEach(({ isolationMode, scriptType }) => {
  const getCaseNameInner = (suffix: string): string => getCaseName(isolationMode, scriptType, suffix);

  async function getWidgetApiFromPage(page: Page): Promise<Locator> {
    const loader = await getLoaderFromPage(page);
    return await getWidgetApi(loader, isolationMode, scriptType);
  }

  function getWidgetTextLocator(locator: Locator, value: string): Locator {
    const isolationModeMap: Record<TestIsolationMode, IsolationMode> = {
      [TestIsolationMode.IFrame]: IsolationMode.IFrame,
      [TestIsolationMode.None]: IsolationMode.None,
    };

    const widgetType = widgetTypeMap[scriptType];
    return locator.getByText(getMessageFromWidget(isolationModeMap[isolationMode], widgetType, "message", value));
  }

  async function ensureWidgetMessageVisible(locator: Locator, value: string): Promise<void> {
    await expect(getWidgetTextLocator(locator, value)).toBeVisible();
  }

  async function ensureNoWidgetMessage(locator: Locator, value: string): Promise<void> {
    await expect(getWidgetTextLocator(locator, value)).toBeHidden();
  }

  test(getCaseNameInner("render-message"), async ({ page }) => {
    const widgetApi = await getWidgetApiFromPage(page);
    const expectedValue = "hi, michael";

    const widget = await initWidget(widgetApi, expectedValue);

    await ensureWidgetMessageVisible(widget, expectedValue);
  });

  test(getCaseNameInner("dispose-widget-removes-single-widget"), async ({ page }) => {
    const widgetApi = await getWidgetApiFromPage(page);

    const expectedValue = "117";
    const widget1 = await initWidget(widgetApi, expectedValue);
    await ensureWidgetMessageVisible(widget1, expectedValue);

    const expectedValue2 = "4884";
    const widget2 = await initWidget(widgetApi, expectedValue2);
    await ensureWidgetMessageVisible(widget2, expectedValue2);

    await widget2
      .locator(createReactSelectorWithFilter(ManualDisposeButton, "text", "Вызвать вручную dispose виджета сверху"))
      .click();

    await ensureWidgetMessageVisible(widget1, expectedValue);
    await ensureNoWidgetMessage(widgetApi, expectedValue2);
  });

  test(getCaseNameInner("dispose-module-removes-all-widgets"), async ({ page }) => {
    const widgetApi = await getWidgetApiFromPage(page);

    const expectedValue = "117";
    const widget1 = await initWidget(widgetApi, expectedValue);
    await ensureWidgetMessageVisible(widget1, expectedValue);

    const expectedValue2 = "4884";
    const widget2 = await initWidget(widgetApi, expectedValue2);
    await ensureWidgetMessageVisible(widget2, expectedValue2);

    await widgetApi
      .locator(createReactSelectorWithFilter(ManualDisposeButton, "text", "Убрать модуль виджета выше из контекста"))
      .click();

    await ensureNoWidgetMessage(widgetApi, expectedValue);
    await ensureNoWidgetMessage(widgetApi, expectedValue2);
  });
});

const createTestCase = (testName: string, routeMock: (route: Route) => void, expects: string) => ({
  testName,
  routeMock,
  expects,
});

getIsolationModeCartesianProduct([
  createTestCase("log-network-error-on-script-route-abort", (route) => route.abort(), "Network error"),
  createTestCase(
    "log-network-error-on-script-route-error",
    (route) =>
      route.fulfill({
        status: 403,
      }),
    "403"
  ),
  createTestCase(
    "log-import-error-on-invalid-script",
    (route) =>
      route.fulfill({
        status: 200,
        body: "aboba",
      }),
    "aboba"
  ),
]).forEach(({ isolationMode, testName, routeMock, expects }) => {
  const scriptType = ScriptType.ReactExternalsWindow;

  test(`${isolationMode}-${testName}`, async ({ page }) => {
    const loader = await getLoaderFromPage(page);
    await page.route(`**/${createJsUrl(scriptType)}`, routeMock);
    await getWidgetApi(loader, isolationMode, scriptType);

    await expect(loader.locator(createReactSelector(FaultContainer))).toContainText(expects);
  });
});
