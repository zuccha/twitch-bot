import { Config } from "../../core/Config";
import CommandHandler, {
  Notifier,
  TwitchInfo,
} from "../../core/CommandHandler";
import { TestContext, TestNotification } from "./types";

export default class TestCommandHandler extends CommandHandler<
  TestContext,
  TestNotification
> {
  constructor(
    context: TestContext,
    config: Config,
    notifier: Notifier<TestNotification>
  ) {
    super(context, config, notifier);
  }

  handle(command: string, params: string[], info: TwitchInfo): void {
    // Do nothing.
  }
}
