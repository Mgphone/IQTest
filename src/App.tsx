import React, { useState } from "react";
import { type Question, type QuizState } from "./types";
import "./App.css";
import DEFAULT_QUESTIONS from "./Requirements/DefaultData.json";

const App: React.FC = () => {
  const [questionPool, setQuestionPool] = useState<Question[]>(
    DEFAULT_QUESTIONS as Question[]
  );
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  const validateQuestion = (obj: unknown): obj is Question => {
    if (typeof obj !== "object" || obj === null) return false;

    const questionObj = obj as Partial<Question>;

    if (
      typeof questionObj.id !== "number" ||
      typeof questionObj.question !== "string" ||
      !Array.isArray(questionObj.options) ||
      !questionObj.options.every((option) => typeof option === "string") ||
      typeof questionObj.answer !== "number" ||
      typeof questionObj.type !== "string"
    ) {
      return false;
    }

    if (
      questionObj.answer < 0 ||
      questionObj.answer >= questionObj.options.length
    ) {
      return false;
    }

    return true;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);

        if (!Array.isArray(parsedData)) {
          throw new Error("File must contain an array of questions");
        }

        const validQuestions = parsedData.filter(validateQuestion);
        if (validQuestions.length === 0) {
          throw new Error("No valid questions found in the file");
        }

        if (validQuestions.length !== parsedData.length) {
          setModalMessage(
            `Warning: ${
              parsedData.length - validQuestions.length
            } invalid questions were skipped. ${
              validQuestions.length
            } questions added successfully.`
          );
        } else {
          setModalMessage(
            `Successfully added ${validQuestions.length} questions from file.`
          );
        }

        const updatedPool = [
          ...(DEFAULT_QUESTIONS as Question[]),
          ...validQuestions,
        ];
        setQuestionPool(updatedPool);
        setShowModal(true);
      } catch (error) {
        setModalMessage(
          `Error reading file: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        setShowModal(true);
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  const handleJsonInput = () => {
    const jsonInput = prompt("Paste your JSON questions here:");
    if (!jsonInput) return;

    try {
      const parsedData = JSON.parse(jsonInput);

      if (!Array.isArray(parsedData)) {
        throw new Error("Input must be an array of questions");
      }

      const validQuestions = parsedData.filter(validateQuestion);
      if (validQuestions.length === 0) {
        throw new Error("No valid questions found in the input");
      }

      if (validQuestions.length !== parsedData.length) {
        setModalMessage(
          `Warning: ${
            parsedData.length - validQuestions.length
          } invalid questions were skipped. ${
            validQuestions.length
          } questions added successfully.`
        );
      } else {
        setModalMessage(
          `Successfully added ${validQuestions.length} questions from JSON input.`
        );
      }

      const updatedPool = [
        ...(DEFAULT_QUESTIONS as Question[]),
        ...validQuestions,
      ];
      setQuestionPool(updatedPool);
      setShowModal(true);
    } catch (error) {
      setModalMessage(
        `Error parsing JSON: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setShowModal(true);
    }
  };

  const selectRandomQuestions = (): Question[] => {
    const shuffled = [...questionPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  };

  const startTest = () => {
    const selectedQuestions = selectRandomQuestions();
    setQuizState({
      questions: selectedQuestions,
      currentQuestionIndex: 0,
      userAnswers: new Array(10).fill(null),
      score: 0,
      isTestFinished: false,
    });
    setIsTestStarted(true);
  };

  const handleAnswerSelect = (selectedIndex: number) => {
    if (!quizState) return;

    const newUserAnswers = [...quizState.userAnswers];
    newUserAnswers[quizState.currentQuestionIndex] = selectedIndex;

    setQuizState({
      ...quizState,
      userAnswers: newUserAnswers,
    });
  };

  const handleNextQuestion = () => {
    if (!quizState) return;

    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      setQuizState({
        ...quizState,
        currentQuestionIndex: quizState.currentQuestionIndex + 1,
      });
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    if (!quizState) return;

    let correctAnswers = 0;
    quizState.questions.forEach((question, index) => {
      if (quizState.userAnswers[index] === question.answer) {
        correctAnswers++;
      }
    });

    setQuizState({
      ...quizState,
      score: correctAnswers,
      isTestFinished: true,
    });
  };

  const calculateIQ = (score: number): number => {
    return Math.round(70 + score * 8);
  };

  const resetTest = () => {
    setIsTestStarted(false);
    setQuizState(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
  };
  const handleCopyPaste = () => {
    const hiddenText = `Question {
id: number;
question: string;
options: string[];
answer: number; // The index of the correct option in the 'options' array
type: string;
} 
i want 10 of those simple json for iq test
`;
    navigator.clipboard
      .writeText(hiddenText)
      .then(() => {
        alert("Copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy!");
      });
  };

  const renderWelcomeScreen = () => (
    <div className="welcome-container">
      <h1>IQ Test Application</h1>
      <p>Test your intelligence with our comprehensive IQ assessment.</p>

      <div className="upload-section">
        <h3>Add Custom Questions</h3>
        <div className="upload-options">
          <div className="upload-option">
            <label htmlFor="file-upload" className="upload-button">
              Upload JSON File
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </div>
          <div className="upload-option">
            <button onClick={handleJsonInput} className="upload-button">
              Paste JSON
            </button>
          </div>
          <div className="copy-paste">
            <button onClick={handleCopyPaste} className="upload-button">
              Click And Paste in AI
            </button>
          </div>
        </div>
        <p className="pool-info">
          Current question pool: {questionPool.length} questions
        </p>
      </div>
      <p className="note">
        Note: If you don’t have a JSON file ready, click "Click And Paste in AI"
        to open an AI tool. Use the AI to generate a short and simple set of IQ
        questions in JSON format. Then copy the AI-generated JSON and paste it
        here to add custom questions.
      </p>
      <button onClick={startTest} className="start-button">
        Start Test
      </button>
    </div>
  );

  const renderQuestion = () => {
    if (!quizState) return null;

    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isAnswered =
      quizState.userAnswers[quizState.currentQuestionIndex] !== null;

    return (
      <div className="question-container">
        <div className="progress">
          Question {quizState.currentQuestionIndex + 1} of{" "}
          {quizState.questions.length}
        </div>

        <div className="question">
          <h2>{currentQuestion.question}</h2>
          <div className="options">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`option ${
                  quizState.userAnswers[quizState.currentQuestionIndex] ===
                  index
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleAnswerSelect(index)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleNextQuestion}
          className="next-button"
          disabled={!isAnswered}
        >
          {quizState.currentQuestionIndex === quizState.questions.length - 1
            ? "Finish Test"
            : "Next Question"}
        </button>
      </div>
    );
  };

  const renderResults = () => {
    if (!quizState) return null;

    const iq = calculateIQ(quizState.score);

    return (
      <div className="results-container">
        <h1>Test Results</h1>
        <div className="score-display">
          <p>
            You answered <strong>{quizState.score}</strong> out of{" "}
            <strong>{quizState.questions.length}</strong> questions correctly.
          </p>
          <p>
            Your estimated IQ: <strong>{iq}</strong>
          </p>
        </div>

        <div className="detailed-results">
          <h3>Question Review</h3>
          {quizState.questions.map((question, index) => {
            const userAnswer = quizState.userAnswers[index];
            const isCorrect = userAnswer === question.answer;

            return (
              <div
                key={question.id}
                className={`result-item ${isCorrect ? "correct" : "incorrect"}`}
              >
                <p>
                  <strong>Q{index + 1}:</strong> {question.question}
                </p>
                <p>
                  Your answer:{" "}
                  {userAnswer !== null
                    ? question.options[userAnswer]
                    : "No answer"}
                </p>
                <p>Correct answer: {question.options[question.answer]}</p>
              </div>
            );
          })}
        </div>

        <button onClick={resetTest} className="restart-button">
          Take Another Test
        </button>
      </div>
    );
  };

  return (
    <div className="App">
      {!isTestStarted
        ? renderWelcomeScreen()
        : quizState?.isTestFinished
        ? renderResults()
        : renderQuestion()}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>{modalMessage}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
