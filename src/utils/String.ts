const $String = {
  normalize: (self: string): string => {
    return self
      .toLowerCase()
      .trim()
      .replace(/ç/g, "c")
      .replace(/ñ/g, "n")
      .replace(/ș/g, "s")
      .replace(/[áàâäåăã]/g, "a")
      .replace(/[éèêë]/g, "e")
      .replace(/[íìîï]/g, "i")
      .replace(/[óòôö]/g, "o")
      .replace(/[úùûü]/g, "u")
      .replace(/-\.,/g, " ")
      .replace(/\s+/g, " ");
  },
};

export default $String;
