export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: number;
  type: string;
  hint?: string;
  media?: string[]; // Array of media file paths
}

// New data format interfaces
export interface IQTestQuestion {
  id: number;
  stem: string;
  options: string[];
  category: string;
}

export interface TestConfig {
  test_suites: {
    seq: string[];
    diagram: string[];
    verbal: string[];
  };
  version: string;
  prev: string;
  version_log: Record<string, string>;
}

export interface AnswerFormat {
  answer: number[];
  hint?: string;
}

export interface TestAnswers {
  [questionId: string]: AnswerFormat;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: (number | null)[];
  score: number;
  isTestFinished: boolean;
  showHints: boolean[];
  answers?: TestAnswers; // For loading correct answers and hints
}

// AI Solver types
export interface SolverResult {
  answer: number;
  confidence: number;
  reasoning: string;
}

export interface TestSuite {
  name: string;
  questions: IQTestQuestion[];
  category: 'seq' | 'diagram' | 'verbal';
}
