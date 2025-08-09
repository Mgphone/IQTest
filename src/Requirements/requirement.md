IQ Test App: A Step-by-Step Guide
This guide breaks down the React and TypeScript code for the IQ Test application. It explains the purpose of each major component, state variable, and function, providing a clear path to understanding how the app works.

1. Data Structures
   The application relies on two main TypeScript interfaces to define its data.

Question Interface
This defines the structure for each individual question object.

interface Question {
id: number;
question: string;
options: string[];
answer: number; // The index of the correct option in the 'options' array
type: string;
}

QuizState Interface
This interface holds all the data needed to manage the state of a running quiz.

interface QuizState {
questions: Question[]; // The 10 questions for the current test
currentQuestionIndex: number; // The index of the question being shown
userAnswers: (number | null)[]; // An array to store the user's selected answers
score: number; // The final number of correct answers
isTestFinished: boolean; // A boolean to track if the test is complete
}

2. State Management
   The main App component uses several useState hooks to manage the application's state.

questionPool: An array of Question objects. This starts with the DEFAULT_QUESTIONS and is updated if a user uploads a new JSON file. The random questions for the test are drawn from this pool.

quizState: An object of type QuizState. This is a crucial state variable that stores all the information about the current test. It is initialized to null before the test starts and populated when the user clicks "Start Test".

isTestStarted: A simple boolean that controls whether the welcome screen or the quiz interface is shown.

modalMessage: A string that holds the message for the custom modal pop-up, used for showing success or error messages (e.g., after a file upload).

3. Core Functions
   These functions contain the core logic of the application, from generating the quiz to calculating the score.

selectRandomQuestions()
This function is responsible for creating a new test.

It creates a copy of the questionPool array.

It shuffles the array using a simple random sort (.sort(() => 0.5 - Math.random())).

It selects the first 10 questions from the shuffled array using .slice(0, 10).

Finally, it initializes the quizState with these 10 questions, an empty userAnswers array, and other default values.

handleFileUpload(event)
This function handles the user-uploaded JSON file.

It uses FileReader to asynchronously read the content of the file.

It attempts to parse the content as JSON.

It validates that the parsed data is an array of objects that conform to the Question interface.

If the file is valid, it appends the new questions to the DEFAULT_QUESTIONS and updates the questionPool state. An error message is displayed in a modal if the file is invalid.

handleAnswerSelect(selectedIndex)
This is called when a user clicks on an answer option.

It creates a copy of the userAnswers array from the current quizState.

It updates the answer for the current question index.

It updates the quizState with the new userAnswers array.

handleNextQuestion()
This function is called when the "Next Question" button is clicked.

It checks if the current question is the last one in the test.

If it's not the last question, it increments the currentQuestionIndex in the quizState to display the next question.

If it is the last question, it calls finishTest() to finalize the test.

finishTest()
This function is called once all questions have been answered.

It iterates through the questions array and the userAnswers array.

It compares each user's answer with the correct answer index.

It tallies the number of correct answers to get the final score.

It updates the quizState to reflect the final score and sets isTestFinished to true.

calculateIQ(score)
This is a simple linear function that maps a score out of 10 to an IQ range of 70-150.

A score of 0 maps to an IQ of 70.

A score of 10 maps to an IQ of 150.

Intermediate scores are linearly interpolated.

4. Component Rendering
   The main App component's return statement uses a ternary operator to conditionally render different parts of the UI based on the application's state.

!isTestStarted: Shows the initial welcome screen (renderWelcomeScreen()).

quizState?.isTestFinished: Shows the results screen (renderResults()) after the test is complete.

default: Shows the question screen (renderQuestion()) while the test is in progress.

This conditional rendering is a common pattern in React for managing different views or "pages" within a single-page application.
