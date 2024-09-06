import { Center } from "@skbkontur/react-ui";
import type { JSX } from "react";
import { FormSkeleton } from "../skeleton/Form.js";

export function Loader(): JSX.Element {
  return (
    <Center>
      <FormSkeleton />
    </Center>
  );
}
