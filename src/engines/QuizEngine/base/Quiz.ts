export default abstract class Quiz {
  protected _question: string;

  constructor(question: string) {
    this._question = question;
  }

  public abstract isAnswerCorrect(answer: string): boolean;

  get question(): string {
    return this._question;
  }
}
