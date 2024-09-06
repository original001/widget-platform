import { injectIntoGlobalHook } from "/@react-refresh";

// window необходимо брать из того window в котором создается используемая копия react
// Мы не знаем из какого именно
injectIntoGlobalHook(window);
injectIntoGlobalHook(window.parent);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
