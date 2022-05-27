import { Notifier, TwitchInfo } from "./CommandHandler";
import { Config } from "./Config";
import { GenericNotification } from "./types";
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

  get features() {
    return this._features;
  }

  handleCommand(command: string, params: string[], info: TwitchInfo) {
    if (this._channel !== info.channel) {
      return;
    }

    if (info.tags.username === info.channel) {
      switch (command) {
        case "!add-feature":
          params[0] && this._handleAddFeature(params[0]);
          break;
        case "!add-all-features":
          this._handleAddAllFeatures();
          break;
        case "!remove-feature":
          params[0] && this._handleRemoveFeature(params[0]);
          break;
        case "!remove-all-features":
          this._handleRemoveAllFeatures();
          break;
      }
    }

    this._features.forEach((feature) => {
      feature.handleCommand(command, params, info);
    });
  }

  private _handleAddFeature(id: string) {
    SUPPORTED_FEATURES.forEach((SupportedFeature) => {
      if (id === SupportedFeature.ID) {
        const feature = new SupportedFeature(this._config, this._notifier);
        this._features.add(SupportedFeature.ID, feature);
      }
    });
    const message = `Feature "${id}" added!`;
    this._notifier.notifyTwitch(this._channel, message);
  }

  private _handleAddAllFeatures() {
    SUPPORTED_FEATURES.forEach((SupportedFeature) => {
      const feature = new SupportedFeature(this._config, this._notifier);
      this._features.add(SupportedFeature.ID, feature);
    });
    const message = `All features added!`;
    this._notifier.notifyTwitch(this._channel, message);
  }

  private _handleRemoveFeature(id: string) {
    SUPPORTED_FEATURES.forEach((SupportedFeature) => {
      if (id === SupportedFeature.ID) {
        this._features.remove(SupportedFeature.ID);
      }
    });
    const message = `Feature "${id}" removed!`;
    this._notifier.notifyTwitch(this._channel, message);
  }

  private _handleRemoveAllFeatures() {
    SUPPORTED_FEATURES.forEach((SupportedFeature) => {
      this._features.remove(SupportedFeature.ID);
    });
    const message = `All features removed!`;
    this._notifier.notifyTwitch(this._channel, message);
  }
}
