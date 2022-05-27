import { Config } from "../../core/Config";
import CommandHandler from "../../core/CommandHandler";
import { Notifier, TwitchInfo } from "../../core/types";
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
    if (command === "!test") {
      this._notifier.notifyTwitch(info.channel, "Hello world!");
    }
  }
}
