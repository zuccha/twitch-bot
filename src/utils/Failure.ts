export default class Failure {
  private _scope: string;
  private _message: string;
  private _maybePrevFailure: Failure | undefined;

  constructor(scope: string, message: string, maybePrev?: Failure) {
    this._scope = scope;
    this._message = message;
    this._maybePrevFailure = maybePrev;
  }

  extend(scope: string, message: string): Failure {
    return new Failure(scope, message, this);
  }

  get scope(): string {
    return this._scope;
  }

  get message(): string {
    return this._message;
  }

  get verbose(): string {
    return `${this._scope}: ${this._message}`;
  }

  get stack(): Failure[] {
    return this._maybePrevFailure
      ? [this, ...this._maybePrevFailure.stack]
      : [this];
  }

  get messageStack(): string[] {
    return this._maybePrevFailure
      ? [this._message, ...this._maybePrevFailure.messageStack]
      : [this._message];
  }

  get verboseStack(): string[] {
    return this._maybePrevFailure
      ? [this.verbose, ...this._maybePrevFailure.verboseStack]
      : [this.verbose];
  }
}
