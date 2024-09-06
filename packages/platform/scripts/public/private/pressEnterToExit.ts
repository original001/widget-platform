import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "process";

export async function pressEnterToExit() {
  const rl = readline.createInterface({ input, output });
  await rl.question("Press enter to exit");
  rl.close();
}
