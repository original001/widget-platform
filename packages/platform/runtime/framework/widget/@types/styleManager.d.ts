export {};

declare global {
  interface Window {
    addStyle: (id: string, cssCode: string) => void;
    removeStyle: (id: string) => void;
  }
}
