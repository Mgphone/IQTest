export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: number;
  type: string;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: (number | null)[];
  score: number;
  isTestFinished: boolean;
}
