export default abstract class Quiz {
  protected _question: string;

  constructor(question: string) {
    this._question = question;
  }

  get question(): string {
    return this._question;
  }

  abstract get answer(): string;

  public abstract isAnswerCorrect(answer: string): boolean;
}
