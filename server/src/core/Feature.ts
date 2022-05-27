import Failure from "../utils/Failure";
import CommandHandler, { TwitchInfo } from "./CommandHandler";
import { GenericContext, GenericNotification } from "./types";

export default abstract class Feature<
  Context extends GenericContext,
  Notification extends GenericNotification
> {
  private _id: string;
  protected _context: Context;
  protected abstract _commandHandler: CommandHandler<Context, Notification>;

  constructor(id: string, context: Context) {
    this._id = id;
    this._context = context;
  }

  get id(): string {
    return this._id;
  }

  abstract getInitialNotification(channel: string): Notification;

  abstract setup(): Promise<Failure | undefined>;

  handleCommand(command: string, params: string[], info: TwitchInfo): void {
    this._commandHandler.handle(command, params, info);
  }
}
