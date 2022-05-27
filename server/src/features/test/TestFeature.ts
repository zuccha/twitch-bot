import { Config } from "../../core/Config";
import Feature from "../../core/Feature";
import { Notifier } from "../../core/types";
import Failure from "../../utils/Failure";
import TestCommandHandler from "./TestCommandHandler";
import { TestContext, TestNotification } from "./types";

export default class TestFeature extends Feature<
  TestContext,
  TestNotification
> {
  static ID = "test";

  protected _commandHandler: TestCommandHandler;

  constructor(config: Config, notifier: Notifier<TestNotification>) {
    super(TestFeature.ID, undefined);
    this._commandHandler = new TestCommandHandler(undefined, config, notifier);
  }

  getInitialNotification(): TestNotification {
    return { type: "TEST", payload: undefined };
  }

  setup(): Promise<Failure | undefined> {
    return Promise.resolve(undefined);
  }
}
