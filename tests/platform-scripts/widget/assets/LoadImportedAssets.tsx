import type { JSX } from "react";
import styles from "./App.module.scss";
import { imageDataTestId } from "./imageDataTestId.js";
import img from "./stylesTestFolder/image.png";

export default function (): JSX.Element {
  return (
    <div className={styles.box}>
      import in js
      <br />
      <img data-testid={imageDataTestId} src={img} />
    </div>
  );
}
