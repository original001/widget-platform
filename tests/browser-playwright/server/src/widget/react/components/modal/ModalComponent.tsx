import { Button, Modal } from "@skbkontur/react-ui";
import type { JSX } from "react";
import { useState } from "react";
import { InputForModalComponent } from "./InputForModalComponent.js";
import { ModalInputComponent } from "./ModalInputComponent.js";
import { ModalLabelComponent } from "./ModalLabelComponent.js";
import { ModalOpenButton } from "./ModalOpenButton.js";

export function ModalComponent(): JSX.Element {
  const [opened, setOpened] = useState(false);
  const [value, setValue] = useState("no value");

  function close() {
    setOpened(false);
  }

  return (
    <>
      <InputForModalComponent value={value} onChange={setValue} />
      {opened && (
        <Modal onClose={close}>
          <Modal.Header>Title</Modal.Header>
          <Modal.Body>
            <ModalInputComponent />
            <ModalLabelComponent children={value} />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={close}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
      <ModalOpenButton onClick={() => setOpened(true)} />
    </>
  );
}
