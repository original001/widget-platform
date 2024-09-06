export type PlaygroundParams<TConfig> = {
  readonly environmentConfig: TConfig;
  readonly widgetUrl: URL;
  readonly container: HTMLElement;
};

export type RenderPlayground<TConfig> = (params: PlaygroundParams<TConfig>) => void;
