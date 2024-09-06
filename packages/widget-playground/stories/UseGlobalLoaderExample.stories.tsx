import { useCounter } from "@react-hookz/web";
import { useList } from "@react-hookz/web";
import { Button, GlobalLoader } from "@skbkontur/react-ui";
import type { Meta, StoryObj } from "@storybook/react";
import { Fragment, type JSX } from "react";
import { useGlobalLoader } from "../esm/index.js";

function UseGlobalLoaderExample(): JSX.Element {
  const [active, { showLoader }] = useGlobalLoader();
  const [disposers, { push, removeAt }] = useList<[VoidFunction, number]>([]);
  const [counter, { inc }] = useCounter();

  return (
    <>
      <GlobalLoader active={active} />
      <>Запущен: {String(active)}</>
      <br />
      <Button
        onClick={() => {
          inc();
          return push([showLoader(), counter]);
        }}
      >
        Запустить еще один loader
      </Button>
      {disposers.map((disposer, index) => (
        <Fragment key={index}>
          <br />
          <Button
            onClick={() => {
              disposer[0]();
              removeAt(index);
            }}
          >
            Остановить лоадер {disposer[1]}
          </Button>
        </Fragment>
      ))}
    </>
  );
}

const meta: Meta<typeof UseGlobalLoaderExample> = {
  component: UseGlobalLoaderExample,
};

export default meta;

type Story = StoryObj<typeof UseGlobalLoaderExample>;

export const Simple: Story = {};
