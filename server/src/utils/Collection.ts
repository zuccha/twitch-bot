import $Array from "./Array";
import Failure from "./Failure";

export default class Collection<T> {
  private _byId: Record<string, T>;
  private _ids: string[];

  constructor(byId: Record<string, T> = {}) {
    this._byId = byId;
    this._ids = Object.keys(byId);
  }

  get length(): number {
    return this._ids.length;
  }

  has(id: string): boolean {
    return this._byId[id] !== undefined;
  }

  byId(id: string): T | undefined {
    return this._byId[id];
  }

  byIdOrFail(id: string): T | Failure {
    const maybeItem = this._byId[id];
    if (!maybeItem) {
      const message = `Item with id "${id}" was not found`;
      return new Failure("Collection.byIdOrFail", message);
    }
    return maybeItem;
  }

  ids(): string[] {
    return this._ids;
  }

  add(id: string, item: T): void {
    const index = this._ids.indexOf(id);
    if (index !== -1) {
      this._ids.splice(index, 1);
    }

    this._byId[id] = item;
    this._ids.push(id);
  }

  remove(id: string): void {
    delete this._byId[id];
    const index = this._ids.indexOf(id);
    if (index !== -1) {
      this._ids.splice(index, 1);
    }
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

  clear(): void {
    this._byId = {};
    this._ids = [];
  }
}
