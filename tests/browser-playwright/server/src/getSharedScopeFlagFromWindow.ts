const windowKey = "shared";

export interface IWindow {
    [windowKey]?: boolean;
}

function getWindow(): IWindow {
    return window as any;
}

export function setSharedScopeFlagToWindow(window: Window, isIframe: boolean): void {
    (window as IWindow)[windowKey] = isIframe;
}

export function getSharedScopeFlagFromWindow(): boolean | undefined {
    return getWindow()[windowKey];
}
