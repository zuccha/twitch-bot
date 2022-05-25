const $String = {
  normalize: (self: string): string => {
    return self.toLowerCase().trim().replace(/\s+/g, "s");
  },
};

export default $String;
