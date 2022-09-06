export type GenericContext = unknown;

export type GenericNotification = { type: string; payload: unknown };

export type Notifier<Notification extends GenericNotification> = {
  notifyTwitch: (channel: string, message: string) => void;
  notifyWebSocket: (notification: Notification) => void;
};

export type TwitchSession = {
  join: (channel: string) => Promise<unknown>;
  part: (channel: string) => Promise<unknown>;
};

export type TwitchInfo = {
  channel: string;
  isUserChannel: boolean;
  user: {
    name: string;
    displayName: string;
    isMod: boolean;
    isSubscriber: boolean;
    isBroadcaster: boolean;
  };
};
