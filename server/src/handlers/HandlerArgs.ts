import tmi from "tmi.js";
import { Config } from "../utils/Config";

export type HandlerArgs<T extends Record<string, unknown> = {}> = {
  command: string;
  params: string[];
  context: T;
  config: Config;
  tags: tmi.ChatUserstate;
  say: (message: string) => void;
};
