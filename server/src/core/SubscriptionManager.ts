import Collection from "../utils/Collection";
import Failure from "../utils/Failure";
import DB from "./DB";
import FeatureManager from "./FeatureManager";
import Subscription from "./Subscription";
import SubscriptionPersistence from "./SubscriptionPersistence";
import {
  GenericNotification,
  Notifier,
  TwitchInfo,
  TwitchSession,
} from "./types";

export default class SubscriptionManager {
  private _subscriptions: Collection<Subscription>;
  private _notifier: Notifier<GenericNotification>;
  private _featureManager: FeatureManager;
  private _session: TwitchSession;
  private _persistence: SubscriptionPersistence;

  constructor(
    notifier: Notifier<GenericNotification>,
    featureManager: FeatureManager,
    db: DB,
    session: TwitchSession
  ) {
    this._subscriptions = new Collection();
    this._notifier = notifier;
    this._featureManager = featureManager;
    this._session = session;
    this._persistence = new SubscriptionPersistence(db);
  }

  async setup(): Promise<Failure | undefined> {
    const users = await this._persistence.getUsers();
    if (users instanceof Failure) {
      return users;
    }

    users.forEach((user) => {
      const subscription = new Subscription(
        user.channel,
        this._notifier,
        this._featureManager,
        this._persistence,
        user.featureIds
      );
      this._subscriptions.add(user.channel, subscription);
      this._session.join(user.channel);
    });
  }

  get(channel: string): Subscription | undefined {
    return this._subscriptions.get(channel);
  }

  handleCommand(command: string, params: string[], info: TwitchInfo): void {
    // The message comes from a channel of a user subscribed to the bot
    if (info.isUserChannel) {
      const subscription = this._subscriptions.get(info.user.name);
      subscription?.handleCommand(command, params, info);
      return;
    }

    // The message comes from the bot's own chat
    if (command === "!join") {
      this._handleJoin(info);
    }
    if (command === "!leave") {
      this._handleLeave(info);
    }
  }

  private _handleJoin(info: TwitchInfo): void {
    if (!this._subscriptions.has(info.user.name)) {
      const subscription = new Subscription(
        info.user.name,
        this._notifier,
        this._featureManager,
        this._persistence
      );
      this._subscriptions.add(info.user.name, subscription);

      this._persistence.addUser(info.user.name);
      this._session.join(info.user.name);

      const message = `${info.user.displayName} has joined!`;
      this._notifier.notifyTwitch(info.channel, message);
    } else {
      const message = `${info.user.displayName} is already joined!`;
      this._notifier.notifyTwitch(info.channel, message);
    }
  }

  private _handleLeave(info: TwitchInfo): void {
    if (this._subscriptions.has(info.user.name)) {
      const subscription = this._subscriptions.get(info.user.name);
      subscription?.clear();

      this._subscriptions.remove(info.user.name);

      this._persistence.removeUser(info.user.name);
      this._session.part(info.user.name);

      const message = `${info.user.displayName} has left!`;
      this._notifier.notifyTwitch(info.channel, message);
    } else {
      const message = `${info.user.displayName} is not joined!`;
      this._notifier.notifyTwitch(info.channel, message);
    }
  }
}
