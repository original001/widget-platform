import type { JSX } from "react";
import styles from "./App.module.scss";
import { imageDataTestId } from "./imageDataTestId.js";

const importMetaUrlImg = new URL("./stylesTestFolder/image.png", import.meta.url).href;

export default function (): JSX.Element {
  return (
    <div className={styles.box}>
      new URL("...", import.meta.url) in js
      <br />
      <img data-testid={imageDataTestId} src={importMetaUrlImg} />
    </div>
  );
}
