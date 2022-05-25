import Failure from "../../../utils/Failure";
import Quiz from "./Quiz";

export default abstract class QuizGenerator {
  abstract generate(): Quiz | Failure;

  abstract setup(): Promise<void>;
}
