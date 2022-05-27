export type GenericContext = unknown;

export type GenericNotification = { type: string; payload: unknown };

export type Notifier<Notification extends GenericNotification> = {
  notifyTwitch: (channel: string, message: string) => void;
  notifyWebSocket: (notification: Notification) => void;
};

export type TwitchInfo = {
  channel: string;
  user: {
    name: string;
    displayName: string;
    isMod: boolean;
    isSubscriber: boolean;
    isBroadcaster: boolean;
  };
};
