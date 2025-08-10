import { type TestConfig, type IQTestQuestion, type TestAnswers, type TestSuite } from './types';
import { getRandomSampleQuestions, getAllSampleQuestions, getQuestionsWithSampleAnswers } from './sampleIQData';

export class DataManager {
  private dataPath = '/data/';
  
  public async loadConfig(configType: 'public' | 'private'): Promise<TestConfig> {
    try {
      const configPath = `${this.dataPath}${configType}.config.json`;
      const response = await fetch(configPath);
      if (!response.ok) {
        throw new Error(`Failed to load ${configType} config`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error loading ${configType} config:`, error);
      throw error;
    }
  }
  
  public async loadTestSuite(suiteName: string): Promise<IQTestQuestion[]> {
    try {
      const suitePath = `${this.dataPath}${suiteName}.json`;
      const response = await fetch(suitePath);
      if (!response.ok) {
        throw new Error(`Failed to load test suite: ${suiteName}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error loading test suite ${suiteName}:`, error);
      throw error;
    }
  }
  
  public async loadAnswers(suiteName: string): Promise<TestAnswers> {
    try {
      const answerPath = `${this.dataPath}${suiteName}.answer.json`;
      const response = await fetch(answerPath);
      if (!response.ok) {
        throw new Error(`Failed to load answers for: ${suiteName}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error loading answers for ${suiteName}:`, error);
      throw error;
    }
  }
  
  public async getAllPublicTestSuites(): Promise<TestSuite[]> {
    const config = await this.loadConfig('public');
    const allSuites: TestSuite[] = [];
    
    // Load sequence tests
    for (const suiteName of config.test_suites.seq) {
      const questions = await this.loadTestSuite(suiteName);
      allSuites.push({
        name: suiteName,
        questions,
        category: 'seq'
      });
    }
    
    // Load diagram tests
    for (const suiteName of config.test_suites.diagram) {
      const questions = await this.loadTestSuite(suiteName);
      allSuites.push({
        name: suiteName,
        questions,
        category: 'diagram'
      });
    }
    
    // Load verbal tests
    for (const suiteName of config.test_suites.verbal) {
      const questions = await this.loadTestSuite(suiteName);
      allSuites.push({
        name: suiteName,
        questions,
        category: 'verbal'
      });
    }
    
    return allSuites;
  }
  
  public async getAllPrivateTestSuites(): Promise<TestSuite[]> {
    try {
      const config = await this.loadConfig('private');
      const allSuites: TestSuite[] = [];
      
      // Load sequence tests
      for (const suiteName of config.test_suites.seq) {
        const questions = await this.loadTestSuite(suiteName);
        allSuites.push({
          name: suiteName,
          questions,
          category: 'seq'
        });
      }
      
      // Load diagram tests
      for (const suiteName of config.test_suites.diagram) {
        const questions = await this.loadTestSuite(suiteName);
        allSuites.push({
          name: suiteName,
          questions,
          category: 'diagram'
        });
      }
      
      // Load verbal tests
      for (const suiteName of config.test_suites.verbal) {
        const questions = await this.loadTestSuite(suiteName);
        allSuites.push({
          name: suiteName,
          questions,
          category: 'verbal'
        });
      }
      
      return allSuites;
    } catch {
      // Fallback to sample data for demonstration
      console.log('Could not load private test data, using sample data for demo');
      const allSampleQuestions = getAllSampleQuestions();
      
      return [
        {
          name: 'sample-private-demo',
          questions: allSampleQuestions,
          category: 'seq'
        }
      ];
    }
  }
  
  public async getRandomQuestions(count: number = 10): Promise<IQTestQuestion[]> {
    try {
      // Try to load from data files first
      const publicSuites = await this.getAllPublicTestSuites();
      const allQuestions: IQTestQuestion[] = [];
      
      // Collect all questions from all suites
      publicSuites.forEach(suite => {
        allQuestions.push(...suite.questions);
      });
      
      if (allQuestions.length > 0) {
        // Shuffle and select random questions
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, shuffled.length));
      }
    } catch {
      console.log('Could not load from data files, using sample questions');
    }
    
    // Fallback to sample questions
    return getRandomSampleQuestions(count);
  }

  public async getQuestionsWithAnswers(count: number = 10): Promise<{questions: IQTestQuestion[], answers: TestAnswers}> {
    try {
      const publicSuites = await this.getAllPublicTestSuites();
      const allQuestions: IQTestQuestion[] = [];
      const allAnswers: TestAnswers = {};
      
      // Collect questions and try to load their answers
      for (const suite of publicSuites) {
        allQuestions.push(...suite.questions);
        
        try {
          const suiteAnswers = await this.loadAnswers(suite.name);
          Object.assign(allAnswers, suiteAnswers);
        } catch {
          console.log(`Could not load answers for ${suite.name}`);
        }
      }
      
      if (allQuestions.length > 0) {
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));
        
        // Filter answers to only include selected questions
        const relevantAnswers: TestAnswers = {};
        selectedQuestions.forEach(q => {
          if (allAnswers[q.id.toString()]) {
            relevantAnswers[q.id.toString()] = allAnswers[q.id.toString()];
          }
        });
        
        return { questions: selectedQuestions, answers: relevantAnswers };
      }
    } catch {
      console.log('Could not load from data files with answers');
    }
    
    // Fallback to sample questions with predefined hints
    return getQuestionsWithSampleAnswers(count);
  }

  
  public convertIQQuestionToAppQuestion(iqQuestion: IQTestQuestion, answers?: import('./types').TestAnswers): import('./types').Question {
    // Validate and fix options if needed
    let options = iqQuestion.options;
    
    // If options are missing or invalid, generate some based on the question
    if (!options || options.length === 0) {
      options = this.generateOptionsForQuestion(iqQuestion.stem);
    }
    
    // Ensure we have at least 3-4 options
    if (options.length < 3) {
      options = this.generateOptionsForQuestion(iqQuestion.stem);
    }

    // Extract media files from question and options
    const media = this.extractMediaFiles(iqQuestion.stem, options);

    // Get hint and correct answer from answers file if available
    let hint: string | undefined;
    let correctAnswer = 0;
    
    if (answers && answers[iqQuestion.id.toString()]) {
      const answerData = answers[iqQuestion.id.toString()];
      hint = answerData.hint;
      correctAnswer = answerData.answer[0] || 0;
    }
    
    return {
      id: iqQuestion.id,
      question: iqQuestion.stem,
      options: options,
      answer: correctAnswer,
      type: iqQuestion.category,
      hint: hint,
      media: media.length > 0 ? media : undefined
    };
  }

  private extractMediaFiles(stem: string, options: string[]): string[] {
    const mediaFiles: string[] = [];
    const imageRegex = /!\[\]\(([^)]+)\)/g;
    
    // Extract from stem
    let match;
    while ((match = imageRegex.exec(stem)) !== null) {
      mediaFiles.push(match[1]);
    }
    
    // Extract from options
    options.forEach(option => {
      imageRegex.lastIndex = 0; // Reset regex
      while ((match = imageRegex.exec(option)) !== null) {
        mediaFiles.push(match[1]);
      }
    });
    
    return [...new Set(mediaFiles)]; // Remove duplicates
  }

  private generateOptionsForQuestion(questionStem: string): string[] {
    // Extract numbers from the question to generate reasonable options
    const numbers = questionStem.match(/-?\d+(?:\.\d+)?(?:\/\d+)?/g);
    
    if (!numbers || numbers.length < 2) {
      // Fallback for non-numeric questions
      return ["Option A", "Option B", "Option C", "Option D"];
    }
    
    const lastNumber = parseFloat(numbers[numbers.length - 1]);
    const secondLastNumber = numbers.length > 1 ? parseFloat(numbers[numbers.length - 2]) : lastNumber;
    
    // Generate options based on sequence patterns
    const options: string[] = [];
    
    if (questionStem.includes("/")) {
      // Fractional sequence - generate fractional options
      options.push("1/2", "2/3", "3/4", "4/5");
    } else {
      // Regular number sequence
      const diff = lastNumber - secondLastNumber;
      const estimatedNext = lastNumber + diff;
      
      // Generate 4 options around the estimated value
      options.push(
        Math.round(estimatedNext - Math.abs(diff)).toString(),
        Math.round(estimatedNext).toString(),
        Math.round(estimatedNext + Math.abs(diff)).toString(),
        Math.round(estimatedNext + Math.abs(diff) * 2).toString()
      );
    }
    
    // Remove duplicates and ensure we have 4 unique options
    const uniqueOptions = [...new Set(options)];
    while (uniqueOptions.length < 4) {
      const randomOffset = Math.floor(Math.random() * 20) - 10;
      const newOption = (lastNumber + randomOffset).toString();
      if (!uniqueOptions.includes(newOption)) {
        uniqueOptions.push(newOption);
      }
    }
    
    return uniqueOptions.slice(0, 4);
  }
  
  public async saveAnswersToFile(suiteName: string, answers: TestAnswers): Promise<void> {
    // In a real implementation, this would save to a file
    // For now, we'll just log and offer download
    const filename = `${suiteName}.answer.json`;
    const content = JSON.stringify(answers, null, 2);
    
    console.log(`Generated answers for ${filename}:`);
    console.log(content);
    
    // Create downloadable file
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}