import { CommandHandlerArgs } from "../utils/CommandHandlerArgs";
import Failure from "../utils/Failure";

export default abstract class Feature<
  Context,
  Notification extends { type: string; payload: unknown }
> {
  protected _context: Context;
  abstract ID: string;

  constructor(context: Context) {
    this._context = context;
  }

  get context(): Context {
    return this._context;
  }

  protected abstract get initialNotification(): Notification;

  getInitialNotification(id: string): Notification | undefined {
    return id === this.ID ? this.initialNotification : undefined;
  }

  abstract setup(): Promise<Failure | undefined>;

  abstract handleCommand(args: CommandHandlerArgs<Notification>): void;
}
