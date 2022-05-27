import { CommandHandlerArgs } from "../utils/CommandHandlerArgs";
import Failure from "../utils/Failure";

export default abstract class Feature<
  Context,
  Notification extends { type: string; payload: unknown }
> {
  private _id: string;
  protected _context: Context;

  constructor(id: string, context: Context) {
    this._id = id;
    this._context = context;
  }

  get context(): Context {
    return this._context;
  }

  protected abstract get initialNotification(): Notification;

  getInitialNotification(id: string): Notification | undefined {
    return id === this._id ? this.initialNotification : undefined;
  }

  abstract setup(): Promise<Failure | undefined>;

  abstract handleCommand(args: CommandHandlerArgs<Notification>): void;
}
