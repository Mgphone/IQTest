import { type IQTestQuestion, type SolverResult } from './types';

export class AIQuestionSolver {
  private async analyzeSequenceQuestion(question: IQTestQuestion): Promise<SolverResult> {
    const stem = question.stem;
    const options = question.options;
    
    // Extract numbers from the sequence
    const numbers = stem.split(/[\s,]+/).map(str => {
      // Handle fractions
      if (str.includes('/')) {
        const [num, den] = str.split('/');
        return parseFloat(num) / parseFloat(den);
      }
      return parseFloat(str.replace('?', ''));
    }).filter(n => !isNaN(n));
    
    // Try different sequence patterns
    const patterns = [
      this.arithmeticProgression,
      this.geometricProgression,
      this.quadraticSequence,
      this.fibonacciVariant,
      this.powerSequence,
      this.recursivePattern
    ];
    
    let bestMatch: SolverResult = {
      answer: 0,
      confidence: 0,
      reasoning: "Unable to determine pattern"
    };
    
    for (const pattern of patterns) {
      try {
        const result = pattern(numbers);
        if (result.confidence > bestMatch.confidence) {
          // Find closest option
          const nextValue = result.nextValue;
          let closestOptionIndex = 0;
          let minDistance = Infinity;
          
          options.forEach((option, index) => {
            let optionValue: number;
            if (option.includes('/')) {
              const [num, den] = option.split('/');
              optionValue = parseFloat(num) / parseFloat(den);
            } else {
              optionValue = parseFloat(option);
            }
            
            const distance = Math.abs(optionValue - nextValue);
            if (distance < minDistance) {
              minDistance = distance;
              closestOptionIndex = index;
            }
          });
          
          if (minDistance < 0.001 || (nextValue > 0.1 && minDistance / nextValue < 0.01)) {
            bestMatch = {
              answer: closestOptionIndex,
              confidence: result.confidence,
              reasoning: result.reasoning
            };
          }
        }
      } catch {
        // Continue with next pattern
      }
    }
    
    // If no pattern found with high confidence, use heuristics
    if (bestMatch.confidence < 0.5) {
      bestMatch = this.heuristicGuess(numbers, options);
    }
    
    return bestMatch;
  }
  
  private arithmeticProgression(numbers: number[]): { nextValue: number; confidence: number; reasoning: string } {
    if (numbers.length < 2) return { nextValue: 0, confidence: 0, reasoning: "" };
    
    const differences = [];
    for (let i = 1; i < numbers.length; i++) {
      differences.push(numbers[i] - numbers[i-1]);
    }
    
    // Check if differences are constant
    const avgDiff = differences.reduce((a, b) => a + b, 0) / differences.length;
    const variance = differences.reduce((sum, diff) => sum + Math.pow(diff - avgDiff, 2), 0) / differences.length;
    
    if (variance < 0.001) {
      return {
        nextValue: numbers[numbers.length - 1] + avgDiff,
        confidence: 0.9,
        reasoning: `Arithmetic sequence with common difference ${avgDiff}`
      };
    }
    
    return { nextValue: 0, confidence: 0, reasoning: "" };
  }
  
  private geometricProgression(numbers: number[]): { nextValue: number; confidence: number; reasoning: string } {
    if (numbers.length < 2) return { nextValue: 0, confidence: 0, reasoning: "" };
    
    const ratios = [];
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i-1] !== 0) {
        ratios.push(numbers[i] / numbers[i-1]);
      }
    }
    
    if (ratios.length === 0) return { nextValue: 0, confidence: 0, reasoning: "" };
    
    const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const variance = ratios.reduce((sum, ratio) => sum + Math.pow(ratio - avgRatio, 2), 0) / ratios.length;
    
    if (variance < 0.001 && Math.abs(avgRatio) > 0.001) {
      return {
        nextValue: numbers[numbers.length - 1] * avgRatio,
        confidence: 0.85,
        reasoning: `Geometric sequence with ratio ${avgRatio.toFixed(3)}`
      };
    }
    
    return { nextValue: 0, confidence: 0, reasoning: "" };
  }
  
  private quadraticSequence(numbers: number[]): { nextValue: number; confidence: number; reasoning: string } {
    if (numbers.length < 3) return { nextValue: 0, confidence: 0, reasoning: "" };
    
    // Check second differences
    const firstDiffs = [];
    for (let i = 1; i < numbers.length; i++) {
      firstDiffs.push(numbers[i] - numbers[i-1]);
    }
    
    const secondDiffs = [];
    for (let i = 1; i < firstDiffs.length; i++) {
      secondDiffs.push(firstDiffs[i] - firstDiffs[i-1]);
    }
    
    if (secondDiffs.length === 0) return { nextValue: 0, confidence: 0, reasoning: "" };
    
    const avgSecondDiff = secondDiffs.reduce((a, b) => a + b, 0) / secondDiffs.length;
    const variance = secondDiffs.reduce((sum, diff) => sum + Math.pow(diff - avgSecondDiff, 2), 0) / secondDiffs.length;
    
    if (variance < 0.001) {
      const nextFirstDiff = firstDiffs[firstDiffs.length - 1] + avgSecondDiff;
      return {
        nextValue: numbers[numbers.length - 1] + nextFirstDiff,
        confidence: 0.8,
        reasoning: `Quadratic sequence with second difference ${avgSecondDiff}`
      };
    }
    
    return { nextValue: 0, confidence: 0, reasoning: "" };
  }
  
  private fibonacciVariant(numbers: number[]): { nextValue: number; confidence: number; reasoning: string } {
    if (numbers.length < 3) return { nextValue: 0, confidence: 0, reasoning: "" };
    
    // Check if each number is sum of previous two
    let isFibonacci = true;
    for (let i = 2; i < numbers.length; i++) {
      const expected = numbers[i-1] + numbers[i-2];
      if (Math.abs(numbers[i] - expected) > 0.001) {
        isFibonacci = false;
        break;
      }
    }
    
    if (isFibonacci) {
      return {
        nextValue: numbers[numbers.length - 1] + numbers[numbers.length - 2],
        confidence: 0.9,
        reasoning: "Fibonacci-like sequence (sum of previous two terms)"
      };
    }
    
    // Check multiplicative Fibonacci: a(n) = a(n-1) * a(n-2)
    let isMultFib = true;
    for (let i = 2; i < numbers.length; i++) {
      const expected = numbers[i-1] * numbers[i-2];
      if (Math.abs(numbers[i] - expected) > 0.001) {
        isMultFib = false;
        break;
      }
    }
    
    if (isMultFib) {
      return {
        nextValue: numbers[numbers.length - 1] * numbers[numbers.length - 2],
        confidence: 0.85,
        reasoning: "Multiplicative sequence (product of previous two terms)"
      };
    }
    
    return { nextValue: 0, confidence: 0, reasoning: "" };
  }
  
  private powerSequence(numbers: number[]): { nextValue: number; confidence: number; reasoning: string } {
    if (numbers.length < 3) return { nextValue: 0, confidence: 0, reasoning: "" };
    
    // Try n^2, n^3, 2^n, etc.
    const patterns = [
      (n: number) => n * n,
      (n: number) => n * n * n,
      (n: number) => Math.pow(2, n),
      (n: number) => n * (n + 1) / 2,
      (n: number) => n * (n - 1) / 2
    ];
    
    const names = ["n²", "n³", "2ⁿ", "triangular numbers", "n(n-1)/2"];
    
    for (let p = 0; p < patterns.length; p++) {
      const pattern = patterns[p];
      let matches = 0;
      let startIndex = 0;
      
      // Try different starting indices
      for (let start = 0; start <= 2; start++) {
        matches = 0;
        for (let i = 0; i < numbers.length; i++) {
          const expected = pattern(i + start + 1);
          if (Math.abs(numbers[i] - expected) < 0.001) {
            matches++;
          }
        }
        if (matches >= numbers.length - 1) {
          startIndex = start;
          break;
        }
      }
      
      if (matches >= numbers.length - 1) {
        return {
          nextValue: pattern(numbers.length + startIndex + 1),
          confidence: 0.8,
          reasoning: `Follows pattern: ${names[p]}`
        };
      }
    }
    
    return { nextValue: 0, confidence: 0, reasoning: "" };
  }
  
  private recursivePattern(numbers: number[]): { nextValue: number; confidence: number; reasoning: string } {
    if (numbers.length < 3) return { nextValue: 0, confidence: 0, reasoning: "" };
    
    // Try a(n) = a(n-1)^2 + a(n-2)
    let matches = 0;
    for (let i = 2; i < numbers.length; i++) {
      const expected = Math.pow(numbers[i-1], 2) + numbers[i-2];
      if (Math.abs(numbers[i] - expected) < 0.001) {
        matches++;
      }
    }
    
    if (matches >= numbers.length - 2) {
      return {
        nextValue: Math.pow(numbers[numbers.length - 1], 2) + numbers[numbers.length - 2],
        confidence: 0.85,
        reasoning: "a(n) = a(n-1)² + a(n-2)"
      };
    }
    
    // Try a(n) = a(n-1) + a(n-2)^2
    matches = 0;
    for (let i = 2; i < numbers.length; i++) {
      const expected = numbers[i-1] + Math.pow(numbers[i-2], 2);
      if (Math.abs(numbers[i] - expected) < 0.001) {
        matches++;
      }
    }
    
    if (matches >= numbers.length - 2) {
      return {
        nextValue: numbers[numbers.length - 1] + Math.pow(numbers[numbers.length - 2], 2),
        confidence: 0.85,
        reasoning: "a(n) = a(n-1) + a(n-2)²"
      };
    }
    
    return { nextValue: 0, confidence: 0, reasoning: "" };
  }
  
  private heuristicGuess(numbers: number[], options: string[]): SolverResult {
    // Simple heuristic: look at the trend and pick the most reasonable option
    if (numbers.length < 2) {
      return { answer: 0, confidence: 0.1, reasoning: "Insufficient data, random guess" };
    }
    
    const lastDiff = numbers[numbers.length - 1] - numbers[numbers.length - 2];
    const estimatedNext = numbers[numbers.length - 1] + lastDiff;
    
    let closestIndex = 0;
    let minDistance = Infinity;
    
    options.forEach((option, index) => {
      const value = parseFloat(option);
      if (!isNaN(value)) {
        const distance = Math.abs(value - estimatedNext);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      }
    });
    
    return {
      answer: closestIndex,
      confidence: 0.3,
      reasoning: `Heuristic guess based on last difference: ${lastDiff}`
    };
  }
  
  private async analyzeVerbalQuestion(question: IQTestQuestion): Promise<SolverResult> {
    // For verbal questions, we'll need more sophisticated analysis
    // This is a simplified version
    return {
      answer: Math.floor(Math.random() * question.options.length),
      confidence: 0.2,
      reasoning: "Verbal question analysis not fully implemented"
    };
  }
  
  private async analyzeDiagramQuestion(question: IQTestQuestion): Promise<SolverResult> {
    // For diagram questions, we would need image analysis
    // This is a placeholder
    return {
      answer: Math.floor(Math.random() * question.options.length),
      confidence: 0.2,
      reasoning: "Diagram question analysis requires image processing"
    };
  }
  
  public async solveQuestion(question: IQTestQuestion): Promise<SolverResult> {
    const category = question.category.toLowerCase();
    
    if (category.includes('sequence')) {
      return this.analyzeSequenceQuestion(question);
    } else if (category.includes('verbal') || category.includes('logic')) {
      return this.analyzeVerbalQuestion(question);
    } else if (category.includes('diagram')) {
      return this.analyzeDiagramQuestion(question);
    }
    
    // Default fallback
    return {
      answer: 0,
      confidence: 0.1,
      reasoning: `Unknown category: ${question.category}`
    };
  }
}