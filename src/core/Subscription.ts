import { GenericNotification, Notifier, TwitchInfo } from "./types";
import Collection from "../utils/Collection";
import FeatureManager, { SupportedFeature } from "./FeatureManager";
import SubscriptionPersistence from "./SubscriptionPersistence";

export default class Subscription {
  private _channel: string;
  private _notifier: Notifier<GenericNotification>;
  private _featureManager: FeatureManager;

  private _features: Collection<SupportedFeature>;
  private _persistence: SubscriptionPersistence;

  constructor(
    channel: string,
    notifier: Notifier<GenericNotification>,
    featureManager: FeatureManager,
    persistence: SubscriptionPersistence,
    featureIds: string[] = []
  ) {
    this._channel = channel;
    this._notifier = notifier;
    this._featureManager = featureManager;
    this._persistence = persistence;

    this._features = new Collection();
    featureIds.forEach((id) => {
      const feature = this._featureManager.get(id);
      if (feature) {
        this._features.add(id, feature);
        feature.addChannel(this._channel);
      }
    });
  }

  get features() {
    return this._features;
  }

  handleCommand(command: string, params: string[], info: TwitchInfo) {
    if (this._channel !== info.channel) {
      return;
    }

    if (info.user.isBroadcaster) {
      switch (command) {
        case "!features":
          this._handleListFeatures();
          break;
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

  clear() {
    this._features.forEach((feature) => {
      feature.removeChannel(this._channel);
      this._persistence.removeFeatureFromUser(this._channel, feature.id);
    });
    this._features.clear();
  }

  private _handleListFeatures() {
    const featuresList = this._features.map((feature) => feature.id).join(", ");
    const message = `Features: ${featuresList || "<none>"}`;
    this._notifier.notifyTwitch(this._channel, message);
  }

  private _handleAddFeature(id: string) {
    const feature = this._featureManager.get(id);
    if (feature && !this._features.has(id)) {
      this._features.add(id, feature);
      this._persistence.addFeatureToUser(this._channel, id);
      feature.addChannel(this._channel);
      const message = `Feature "${id}" added!`;
      this._notifier.notifyTwitch(this._channel, message);
    }
  }

  private _handleAddAllFeatures() {
    this._featureManager.forEach((feature) => {
      if (!this._features.has(feature.id)) {
        this._features.add(feature.id, feature);
        this._persistence.addFeatureToUser(this._channel, feature.id);
        feature.addChannel(this._channel);
      }
    });
    const message = `All features added!`;
    this._notifier.notifyTwitch(this._channel, message);
  }

  private _handleRemoveFeature(id: string) {
    const feature = this._featureManager.get(id);
    if (feature && this._features.has(id)) {
      feature.removeChannel(this._channel);
      this._persistence.removeFeatureFromUser(this._channel, feature.id);
      this._features.remove(id);
    }
    const message = `Feature "${id}" removed!`;
    this._notifier.notifyTwitch(this._channel, message);
  }

  private _handleRemoveAllFeatures() {
    this.clear();
    const message = `All features removed!`;
    this._notifier.notifyTwitch(this._channel, message);
  }
}
