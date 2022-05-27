import tmi from "tmi.js";
import { Config } from "./Config";
import { GenericContext, GenericNotification } from "./types";

export type Notifier<Notification extends GenericNotification> = {
  notifyTwitch: (channel: string, message: string) => void;
  notifyWebSocket: (notification: Notification) => void;
};

export type TwitchInfo = {
  channel: string;
  tags: tmi.ChatUserstate;
};

export default abstract class CommandHandler<
  Context extends GenericContext,
  Notification extends GenericNotification
> {
  protected _context: Context;
  protected _config: Config;
  protected _notifier: Notifier<Notification>;

  constructor(
    context: Context,
    config: Config,
    notifier: Notifier<Notification>
  ) {
    this._context = context;
    this._config = config;
    this._notifier = notifier;
  }

  abstract handle(command: string, params: string[], info: TwitchInfo): void;
}
