import tmi from "tmi.js";
import { Config } from "./Config";

export type CommandHandlerArgs<
  Notification extends { type: string; payload: unknown },
  Context extends Record<string, unknown> = {}
> = {
  command: string;
  params: string[];
  context: Context;
  config: Config;
  tags: tmi.ChatUserstate;
  notify: (notification: Notification) => void;
  say: (message: string) => void;
};
