import type { FC } from "react";

interface Props {
  readonly message: string;
  readonly account: string;
}

export const App: FC<Props> = ({ message, account }) => (
  <h1>
    {message}, {account}!
  </h1>
);
