import QuizEngine from "./engine/QuizEngine";

export type QuizContext = { quizEngine: QuizEngine };

export type QuizNotification =
  | { type: "QUIZ"; payload: { question: string | undefined } }
  | { type: "QUIZ_STARTED"; payload: { question: string } }
  | { type: "QUIZ_ENDED"; payload: { answer: string } }
  | { type: "QUIZ_GUESSED"; payload: { answer: string } };
