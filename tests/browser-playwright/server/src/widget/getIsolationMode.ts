import { getSharedScopeFlagFromWindow } from "../getSharedScopeFlagFromWindow.js";

export enum IsolationMode {
    Unset = "unset",
    IFrame = "iframe",
    None = "none",
}

export function getIsolationMode(): IsolationMode {
    const sharedFlag = getSharedScopeFlagFromWindow();

    if (sharedFlag === undefined) {
        return IsolationMode.Unset;
    }

    return sharedFlag ? IsolationMode.IFrame : IsolationMode.None;
}
