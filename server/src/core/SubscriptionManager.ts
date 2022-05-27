import Collection from "../utils/Collection";
import Failure from "../utils/Failure";
import Logger from "../utils/Logger";
import DB from "./DB";
import FeatureManager from "./FeatureManager";
import Subscription from "./Subscription";
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
  private _db: DB;
  private _session: TwitchSession;

  constructor(
    notifier: Notifier<GenericNotification>,
    featureManager: FeatureManager,
    db: DB,
    session: TwitchSession
  ) {
    this._subscriptions = new Collection();
    this._notifier = notifier;
    this._featureManager = featureManager;
    this._db = db;
    this._session = session;
  }

  async setup(): Promise<Failure | undefined> {
    const users = await this._db.getUsers();
    if (users instanceof Failure) {
      return users;
    }

    users.forEach((user) => {
      const subscription = new Subscription(
        user.channel,
        this._notifier,
        this._featureManager,
        user.featureIds
      );
      this._subscriptions.add(user.channel, subscription);
    });
  }

  get(channel: string): Subscription | undefined {
    return this._subscriptions.byId(channel);
  }

  handleCommand(command: string, params: string[], info: TwitchInfo): void {
    // The message comes from a channel of a user subscribed to the bot
    if (info.isUserChannel) {
      const subscription = this._subscriptions.byId(info.user.name);
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
        this._featureManager
      );
      this._subscriptions.add(info.user.name, subscription);

      this._db.addUser(info.user.name);
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
      const subscription = this._subscriptions.byId(info.user.name);
      subscription?.clear();

      this._subscriptions.remove(info.user.name);

      this._db.removeUser(info.user.name);
      this._session.part(info.user.name);

      const message = `${info.user.displayName} has left!`;
      this._notifier.notifyTwitch(info.channel, message);
    } else {
      const message = `${info.user.displayName} is not joined!`;
      this._notifier.notifyTwitch(info.channel, message);
    }
  }
}
