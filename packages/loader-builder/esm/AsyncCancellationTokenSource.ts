type Actions<T> = (() => Promise<T>)[];

class ActionsHolder<T> {
  private actions: Actions<T> | null = [];

  private getActions(): Actions<T> {
    if (this.actions === null) throw Error("Cancellation was requested");

    return this.actions;
  }

  add(action: () => Promise<T>): void {
    this.getActions().unshift(action);
  }

  clear(): Actions<T> {
    const copy = this.getActions();
    this.actions = null;
    return copy;
  }
}

class AsyncCancellationToken<T> {
  constructor(private readonly holder: ActionsHolder<T>) {}

  register(action: () => Promise<T>): void {
    this.holder.add(action);
  }
}

export class AsyncCancellationTokenSource<T> {
  private readonly holder: ActionsHolder<T> = new ActionsHolder<T>();

  token = new AsyncCancellationToken<T>(this.holder);

  cancel = async (): Promise<T[]> => {
    const actions = this.holder.clear();

    const results: T[] = [];
    for (const action of actions) {
      const items = await action();
      results.push(items);
    }

    return results;
  };
}
