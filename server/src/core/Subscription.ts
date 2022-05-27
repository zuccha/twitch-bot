import { Notifier, TwitchInfo } from "./CommandHandler";
import { Config } from "./Config";
import { GenericNotification } from "./types";
import Collection from "../utils/Collection";
import FeatureManager, { SupportedFeature } from "./FeatureManager";

export default class Subscription {
  private _channel: string;
  private _config: Config;
  private _notifier: Notifier<GenericNotification>;
  private _featureManager: FeatureManager;

  private _features: Collection<SupportedFeature>;

  constructor(
    channel: string,
    config: Config,
    notifier: Notifier<GenericNotification>,
    featureManager: FeatureManager
  ) {
    this._channel = channel;
    this._config = config;
    this._notifier = notifier;
    this._featureManager = featureManager;

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
    const feature = this._featureManager.get(id);
    if (feature) {
      this._features.add(id, feature);
      const message = `Feature "${id}" added!`;
      this._notifier.notifyTwitch(this._channel, message);
    }
  }

  private _handleAddAllFeatures() {
    this._featureManager.forEach((feature) => {
      this._features.add(feature.id, feature);
    });
    const message = `All features added!`;
    this._notifier.notifyTwitch(this._channel, message);
  }

  private _handleRemoveFeature(id: string) {
    this._features.remove(id);
    const message = `Feature "${id}" removed!`;
    this._notifier.notifyTwitch(this._channel, message);
  }

  private _handleRemoveAllFeatures() {
    this._features.clear();
    const message = `All features removed!`;
    this._notifier.notifyTwitch(this._channel, message);
  }
}
