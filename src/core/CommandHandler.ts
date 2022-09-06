import { Config } from "./Config";
import {
  GenericContext,
  GenericNotification,
  Notifier,
  TwitchInfo,
} from "./types";

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
