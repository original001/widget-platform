import type { JSX } from "react";
import styles from "./App.module.scss";
import { imageDataTestId } from "./imageDataTestId.js";
import styleAssets from "./stylesTestFolder/inner/styles.module.scss";

export default function (): JSX.Element {
  return (
    <div className={styles.box}>
      background: url("...") in css
      <br />
      <div data-testid={imageDataTestId} className={styleAssets.image}></div>
    </div>
  );
}
