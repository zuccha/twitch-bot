import $Array from "./Array";
import Failure from "./Failure";

export default class Collection<T> {
  private _byId: Record<string, T>;
  private _ids: string[];

  constructor(byId: Record<string, T> = {}) {
    this._byId = byId;
    this._ids = Object.keys(byId);
  }

  byId(id: string): Failure | T {
    const maybeItem = this._byId[id];
    return maybeItem
      ? maybeItem
      : new Failure("Collection.byId", `Item with id ${id} not found`);
  }

  ids(): string[] {
    return this._ids;
  }

  add(id: string, item: T): Failure | undefined {
    if (this._ids.includes(id)) {
      return new Failure("Collection.add", `Item with id ${id} already exists`);
    }

    this._byId[id] = item;
    this._ids.push(id);
  }

  remove(id: string): Failure | undefined {
    if (!this._ids.includes(id)) {
      return new Failure(
        "Collection.remove",
        `Item with id ${id} doesn't exist`
      );
    }

    delete this._byId[id];
    const idNotEqual = (itemId: string): boolean => itemId !== id;
    this._ids = this._ids.filter(idNotEqual);
  }

  random(): Failure | T {
    const maybeId = $Array.randomItem(this._ids);
    if (!maybeId) {
      return new Failure("Collection.random", "Collection is empty");
    }

    const maybeItem = this._byId[maybeId];
    if (!maybeItem) {
      return new Failure("Collection.random", "Collection is empty");
    }

    return maybeItem;
  }

  forEach(fn: (item: T) => void): void {
    this._ids.forEach((id) => fn(this._byId[id]!));
  }

  map<R>(fn: (item: T) => R): R[] {
    return this._ids.map((id) => fn(this._byId[id]!));
  }
}
