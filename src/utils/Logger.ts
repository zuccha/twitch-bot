import chalk from "chalk";
import Failure from "./Failure";

export default class Logger {
  static error(message: string): void {
    console.log(chalk.red(message));
  }

  static fail(failure: Failure): void {
    console.log(chalk.red(failure.message));
    console.log(chalk.red("Closing..."));
    process.exit(1);
  }
}
