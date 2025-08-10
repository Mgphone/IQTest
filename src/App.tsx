import React, { useState, useEffect } from "react";
import { type Question, type QuizState, type IQTestQuestion } from "./types";
import "./App.css";
import { DataManager } from "./DataManager";
import { AIQuestionSolver } from "./AIQuestionSolver";
import QuestionRenderer from "./QuestionRenderer";
import HintRenderer from "./HintRenderer";

const App: React.FC = () => {
  const [questionPool, setQuestionPool] = useState<Question[]>([]);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [dataManager] = useState(new DataManager());
  const [aiSolver] = useState(new AIQuestionSolver());
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [currentTestMode, setCurrentTestMode] = useState<'manual' | 'ai-solve'>('manual');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // Load initial question pool on component mount
  useEffect(() => {
    const loadInitialQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        const { questions: randomQuestions, answers } = await dataManager.getQuestionsWithAnswers(20);
        const convertedQuestions = randomQuestions.map(q => dataManager.convertIQQuestionToAppQuestion(q, answers));
        const sanitizedQuestions = sanitizeQuestions(convertedQuestions);
        
        if (sanitizedQuestions.length === 0) {
          throw new Error('No valid questions could be loaded');
        }
        
        setQuestionPool(sanitizedQuestions);
        
        if (sanitizedQuestions.length < convertedQuestions.length) {
          console.warn(`${convertedQuestions.length - sanitizedQuestions.length} questions were filtered out due to missing data`);
        }
      } catch (error) {
        console.error('Error loading initial questions:', error);
        setModalMessage('Error loading questions. Please try refreshing the page.');
        setShowModal(true);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadInitialQuestions();
  }, [dataManager]);

  const validateQuestion = (obj: unknown): obj is Question => {
    if (typeof obj !== "object" || obj === null) return false;

    const questionObj = obj as Partial<Question>;

    // Basic type validation
    if (
      typeof questionObj.id !== "number" ||
      typeof questionObj.question !== "string" ||
      !Array.isArray(questionObj.options) ||
      typeof questionObj.type !== "string"
    ) {
      return false;
    }

    // Validate options array
    if (questionObj.options.length < 2) {
      return false;
    }

    // Ensure all options are strings and not empty
    if (!questionObj.options.every((option) => typeof option === "string" && option.trim().length > 0)) {
      return false;
    }

    // Validate answer index
    if (
      typeof questionObj.answer === "number" &&
      (questionObj.answer < 0 || questionObj.answer >= questionObj.options.length)
    ) {
      return false;
    }

    return true;
  };

  const sanitizeQuestions = (questions: Question[]): Question[] => {
    return questions.filter((question) => {
      // Additional validation for display
      if (!question.question || question.question.trim().length === 0) {
        console.warn(`Question ${question.id} has empty question text`);
        return false;
      }
      
      if (!question.options || question.options.length < 2) {
        console.warn(`Question ${question.id} has insufficient options`);
        return false;
      }
      
      // Check for empty options
      const validOptions = question.options.filter(opt => opt && opt.trim().length > 0);
      if (validOptions.length < 2) {
        console.warn(`Question ${question.id} has empty options`);
        return false;
      }
      
      // Update the question with valid options only
      question.options = validOptions;
      
      // Adjust answer index if needed
      if (question.answer >= question.options.length) {
        question.answer = 0; // Default to first option
      }
      
      return true;
    });
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
          ...questionPool,
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
        ...questionPool,
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

  const startTest = async () => {
    const selectedQuestions = selectRandomQuestions();
    
    if (currentTestMode === 'ai-solve') {
      // AI solve mode - automatically solve all questions
      setModalMessage("AI is solving the test questions...");
      setShowModal(true);
      
      const aiAnswers = new Array(selectedQuestions.length).fill(null);
      
      for (let i = 0; i < selectedQuestions.length; i++) {
        const question = selectedQuestions[i];
        const iqQuestion: IQTestQuestion = {
          id: question.id,
          stem: question.question,
          options: question.options,
          category: question.type
        };
        
        const result = await aiSolver.solveQuestion(iqQuestion);
        aiAnswers[i] = result.answer;
        
        // Update selected questions with AI's answer
        selectedQuestions[i].answer = result.answer;
        
        // Small delay for demonstration
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      setQuizState({
        questions: selectedQuestions,
        currentQuestionIndex: selectedQuestions.length, // Skip to end
        userAnswers: aiAnswers,
        score: 0,
        isTestFinished: true,
        showHints: new Array(selectedQuestions.length).fill(true), // Show all hints in AI mode
      });
      
      setShowModal(false);
    } else {
      // Manual mode
      setQuizState({
        questions: selectedQuestions,
        currentQuestionIndex: 0,
        userAnswers: new Array(selectedQuestions.length).fill(null),
        score: 0,
        isTestFinished: false,
        showHints: new Array(selectedQuestions.length).fill(false), // Hide hints initially
      });
    }
    
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

  const toggleHint = (questionIndex: number) => {
    if (!quizState) return;
    
    const newShowHints = [...quizState.showHints];
    newShowHints[questionIndex] = !newShowHints[questionIndex];
    
    setQuizState({
      ...quizState,
      showHints: newShowHints
    });
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

  const handleLoadIQData = async () => {
    try {
      setModalMessage("Loading IQ test data...");
      setShowModal(true);
      
      const { questions: randomQuestions, answers } = await dataManager.getQuestionsWithAnswers(10);
      const convertedQuestions = randomQuestions.map(q => dataManager.convertIQQuestionToAppQuestion(q, answers));
      const sanitizedQuestions = sanitizeQuestions(convertedQuestions);
      
      if (sanitizedQuestions.length === 0) {
        setModalMessage("No valid questions could be loaded. Please check your data files.");
        return;
      }
      
      setQuestionPool(prevPool => [...prevPool, ...sanitizedQuestions]);
      setModalMessage(`Successfully loaded ${sanitizedQuestions.length} additional IQ test questions.`);
      
      if (sanitizedQuestions.length < convertedQuestions.length) {
        console.warn(`${convertedQuestions.length - sanitizedQuestions.length} questions were filtered out due to incomplete data`);
      }
      
      setTimeout(() => setShowModal(false), 2000);
    } catch (error) {
      setModalMessage(`Error loading IQ data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSolvePrivateTests = async () => {
    setIsProcessingAI(true);
    setModalMessage("Processing private tests with AI solver...");
    setShowModal(true);

    try {
      const privateSuites = await dataManager.getAllPrivateTestSuites();
      
      for (const suite of privateSuites) {
        const answers: Record<string, { answer: number[], hint: string }> = {};
        
        for (const question of suite.questions) {
          const result = await aiSolver.solveQuestion(question);
          answers[question.id.toString()] = {
            answer: [result.answer],
            hint: result.reasoning
          };
          
          // Add small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Save the answers
        await dataManager.saveAnswersToFile(suite.name, answers);
      }
      
      setModalMessage(`Successfully processed ${privateSuites.length} test suites. Answer files have been generated.`);
      
    } catch (error) {
      setModalMessage(`Error processing tests: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setIsProcessingAI(false);
  };

  const renderWelcomeScreen = () => (
    <div className="welcome-container">
      <h1>IQ Test Application</h1>
      <p>Test your intelligence with our comprehensive IQ assessment.</p>
      
      {isLoadingQuestions && (
        <div className="loading-indicator">
          <p>Loading questions...</p>
        </div>
      )}

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
          <div className="upload-option">
            <button onClick={handleLoadIQData} className="upload-button">
              Load IQ Test Data
            </button>
          </div>
          <div className="upload-option">
            <button onClick={handleSolvePrivateTests} className="upload-button" disabled={isProcessingAI}>
              {isProcessingAI ? 'Processing...' : 'Solve Private Tests'}
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
      <div className="test-mode-selection">
        <label className="mode-option">
          <input
            type="radio"
            name="testMode"
            value="manual"
            checked={currentTestMode === 'manual'}
            onChange={(e) => setCurrentTestMode(e.target.value as 'manual')}
          />
          Manual Test (You Answer)
        </label>
        <label className="mode-option">
          <input
            type="radio"
            name="testMode"
            value="ai-solve"
            checked={currentTestMode === 'ai-solve'}
            onChange={(e) => setCurrentTestMode(e.target.value as 'ai-solve')}
          />
          AI Solve Demo
        </label>
      </div>
      <button 
        onClick={startTest} 
        className="start-button" 
        disabled={isLoadingQuestions || questionPool.length === 0}
      >
        {isLoadingQuestions ? 'Loading...' : 'Start Test'}
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
          <QuestionRenderer content={currentQuestion.question} className="question-text" />
          
          {/* Display media files if available */}
          {currentQuestion.media && currentQuestion.media.length > 0 && (
            <div className="question-media">
              {currentQuestion.media.map((mediaPath, index) => {
                // Fix image path - ensure it starts with / and handle data/ prefix
                let correctedPath = mediaPath;
                if (!correctedPath.startsWith('/')) {
                  correctedPath = `/${correctedPath}`;
                }
                // If it doesn't start with /data/, add it
                if (!correctedPath.startsWith('/data/')) {
                  correctedPath = `/data/${mediaPath}`;
                }
                
                return (
                  <div key={index} className="image-container">
                    <img
                      src={correctedPath}
                      alt={`Question media ${index + 1}`}
                      className="question-image"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const originalSrc = target.src;
                        
                        if (!target.dataset.retried) {
                          target.dataset.retried = 'true';
                          
                          // Try just the original path without modifications
                          if (!originalSrc.endsWith(mediaPath)) {
                            target.src = `/${mediaPath}`;
                            return;
                          }
                        }
                        
                        if (!target.dataset.retried2) {
                          target.dataset.retried2 = 'true';
                          
                          // Try with public prefix
                          target.src = `/public/data/${mediaPath.replace(/^data\//, '')}`;
                          return;
                        }
                        
                        // Show fallback
                        target.style.display = 'none';
                        const container = target.parentElement;
                        if (container && !container.querySelector('.image-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.textContent = `[Media: ${mediaPath.split('/').pop()} not found]`;
                          fallback.className = 'image-fallback';
                          container.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
          
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
                <QuestionRenderer content={option} />
              </button>
            ))}
          </div>
          
          {/* Hint section */}
          <div className="hint-section">
            <button 
              className="hint-button"
              onClick={() => toggleHint(quizState.currentQuestionIndex)}
              disabled={!currentQuestion.hint}
            >
              {quizState.showHints[quizState.currentQuestionIndex] ? '🙈 Hide Hint' : '💡 Show Hint'}
            </button>
            
            {quizState.showHints[quizState.currentQuestionIndex] && currentQuestion.hint && (
              <div className="hint-content">
                <p><strong>💡 Hint:</strong></p>
                <HintRenderer hint={currentQuestion.hint} />
              </div>
            )}
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
                <div>
                  <strong>Q{index + 1}:</strong> <QuestionRenderer content={question.question} />
                </div>
                <div>
                  Your answer:{" "}
                  {userAnswer !== null
                    ? <QuestionRenderer content={question.options[userAnswer]} />
                    : "No answer"}
                </div>
                <div>Correct answer: <QuestionRenderer content={question.options[question.answer]} /></div>
                {question.hint && (
                  <div className="result-hint">
                    <strong>💡 Hint:</strong>
                    <HintRenderer hint={question.hint} />
                  </div>
                )}
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
