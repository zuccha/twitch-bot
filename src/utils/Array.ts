const $Array = {
  randomItem: <T>(self: T[]): T | undefined => {
    return self[Math.floor(Math.random() * self.length)];
  },
};

export default $Array;
