import tmi from "tmi.js";
import { Config } from "./Config";

export type CommandHandlerArgs<
  Context extends Record<string, unknown> = {},
  NotifyMessage = { type: string; payload: undefined }
> = {
  command: string;
  params: string[];
  context: Context;
  config: Config;
  tags: tmi.ChatUserstate;
  notify: (message: NotifyMessage) => void;
  say: (message: string) => void;
};
