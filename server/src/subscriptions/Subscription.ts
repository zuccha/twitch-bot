import { config } from "dotenv";
import { Notifier, TwitchInfo } from "../core/CommandHandler";
import { Config } from "../core/Config";
import { GenericNotification } from "../core/types";
import QuizFeature from "../features/quiz/QuizFeature";
import TestFeature from "../features/test/TestFeature";
import Collection from "../utils/Collection";

const SUPPORTED_FEATURES = [QuizFeature, TestFeature] as const;
type SupportedFeatures = QuizFeature | TestFeature;

export default class Subscription {
  private _channel: string;
  private _config: Config;
  private _notifier: Notifier<GenericNotification>;

  private _features: Collection<SupportedFeatures>;

  constructor(
    channel: string,
    config: Config,
    notifier: Notifier<GenericNotification>
  ) {
    this._channel = channel;
    this._config = config;
    this._notifier = notifier;

    this._features = new Collection();
  }

  handleCommand(command: string, params: string[], info: TwitchInfo) {
    if (command === "!add-feature") {
      const id = params[0];
      SUPPORTED_FEATURES.forEach((SupportedFeature) => {
        if (id === SupportedFeature.ID) {
          const feature = new SupportedFeature(this._config, this._notifier);
          this._features.add(SupportedFeature.ID, feature);
        }
      });
      return;
    }

    if (command === "!add-all-features") {
      SUPPORTED_FEATURES.forEach((SupportedFeature) => {
        const feature = new SupportedFeature(this._config, this._notifier);
        this._features.add(SupportedFeature.ID, feature);
      });
      return;
    }

    if (command === "!remove-feature") {
      const id = params[0];
      SUPPORTED_FEATURES.forEach((SupportedFeature) => {
        if (id === SupportedFeature.ID) {
          this._features.remove(SupportedFeature.ID);
        }
      });
      return;
    }

    if (command === "!remove-all-features") {
      SUPPORTED_FEATURES.forEach((SupportedFeature) => {
        this._features.remove(SupportedFeature.ID);
      });
      return;
    }

    this._features.forEach((feature) => {
      feature.handleCommand(command, params, info);
    });
  }
}
