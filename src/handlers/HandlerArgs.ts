import tmi from "tmi.js";

export type HandlerArgs<T extends Record<string, unknown> = {}> = {
  command: string;
  params: string[];
  context: T;
  config: {
    channel: string;
  };
  tags: tmi.ChatUserstate;
};
