export type PlaygroundDevConfig<T> = {
  readonly environmentConfig: T;
};

export type PlaygroundEnvironmentConfig<T> = {
  readonly loaderUrlPrefix: URL;
  readonly environmentConfig: T;
};

export type GetPlaygroundDevConfig<T = void> = () => Promise<PlaygroundDevConfig<T>>;
export type GetPlaygroundEnvironmentConfig<T = void> = () => Promise<PlaygroundEnvironmentConfig<T>>;
