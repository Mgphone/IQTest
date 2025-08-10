const fs = require('fs');
const path = require('path');

// Simple AI solver implementation in JavaScript
class SimpleAISolver {
  constructor() {}

  async solveQuestion(question) {
    const stem = question.stem;
    const options = question.options;
    const category = question.category.toLowerCase();
    
    if (category.includes('sequence')) {
      return this.analyzeSequenceQuestion(question);
    }
    
    // For non-sequence questions, return a reasonable guess
    return {
      answer: Math.floor(Math.random() * options.length),
      confidence: 0.2,
      reasoning: `Category: ${question.category} - Pattern analysis not fully implemented`
    };
  }

  analyzeSequenceQuestion(question) {
    const stem = question.stem;
    const options = question.options;
    
    // Extract numbers from the sequence
    const numbers = stem.split(/[\s,]+/).map(str => {
      if (str.includes('/')) {
        const [num, den] = str.split('/');
        return parseFloat(num) / parseFloat(den);
      }
      return parseFloat(str.replace('?', ''));
    }).filter(n => !isNaN(n));

    // Try arithmetic progression
    if (numbers.length >= 2) {
      const differences = [];
      for (let i = 1; i < numbers.length; i++) {
        differences.push(numbers[i] - numbers[i-1]);
      }
      
      const avgDiff = differences.reduce((a, b) => a + b, 0) / differences.length;
      const variance = differences.reduce((sum, diff) => sum + Math.pow(diff - avgDiff, 2), 0) / differences.length;
      
      if (variance < 0.001) {
        const nextValue = numbers[numbers.length - 1] + avgDiff;
        
        // Find closest option
        let closestOptionIndex = 0;
        let minDistance = Infinity;
        
        options.forEach((option, index) => {
          let optionValue;
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
          return {
            answer: closestOptionIndex,
            confidence: 0.9,
            reasoning: `Arithmetic sequence with common difference ${avgDiff}`
          };
        }
      }
    }

    // Try geometric progression
    if (numbers.length >= 2) {
      const ratios = [];
      for (let i = 1; i < numbers.length; i++) {
        if (numbers[i-1] !== 0) {
          ratios.push(numbers[i] / numbers[i-1]);
        }
      }
      
      if (ratios.length > 0) {
        const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
        const variance = ratios.reduce((sum, ratio) => sum + Math.pow(ratio - avgRatio, 2), 0) / ratios.length;
        
        if (variance < 0.001 && Math.abs(avgRatio) > 0.001) {
          const nextValue = numbers[numbers.length - 1] * avgRatio;
          
          let closestOptionIndex = 0;
          let minDistance = Infinity;
          
          options.forEach((option, index) => {
            let optionValue;
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
            return {
              answer: closestOptionIndex,
              confidence: 0.85,
              reasoning: `Geometric sequence with ratio ${avgRatio.toFixed(3)}`
            };
          }
        }
      }
    }

    // Fallback: heuristic guess
    if (numbers.length >= 2) {
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

    return {
      answer: 0,
      confidence: 0.1,
      reasoning: "Insufficient data for pattern analysis"
    };
  }
}

const PRIVATE_TEST_FILES = [
  'seq-private',
  'T517-621-private',
  'T622-726-private', 
  'T727-769-private',
  'verbal-E-private',
  'logic-E-private',
  'verbal1-private'
];

async function generateAnswersForPrivateTests() {
  const aiSolver = new SimpleAISolver();
  const dataPath = path.join(__dirname, 'src', 'Requirements', 'data');
  
  console.log('🤖 Starting AI-powered answer generation for private test data...\n');
  
  for (const testFile of PRIVATE_TEST_FILES) {
    try {
      console.log(`📝 Processing: ${testFile}.json`);
      
      const testFilePath = path.join(dataPath, `${testFile}.json`);
      
      if (!fs.existsSync(testFilePath)) {
        console.log(`⚠️  File not found: ${testFilePath}, skipping...`);
        continue;
      }
      
      const questionsData = fs.readFileSync(testFilePath, 'utf-8');
      const questions = JSON.parse(questionsData);
      
      const answers = {};
      const results = [];
      
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        console.log(`  🔍 Solving question ${question.id}: ${question.stem.substring(0, 50)}...`);
        
        const solverResult = await aiSolver.solveQuestion(question);
        
        answers[question.id.toString()] = {
          answer: [solverResult.answer],
          hint: solverResult.reasoning
        };
        
        results.push({ question, result: solverResult });
        
        const confidence = Math.round(solverResult.confidence * 100);
        console.log(`    ✅ Answer: ${solverResult.answer} (${confidence}% confidence)`);
        console.log(`    💡 Reasoning: ${solverResult.reasoning}`);
      }
      
      const answerFilePath = path.join(dataPath, `${testFile}.answer.json`);
      fs.writeFileSync(answerFilePath, JSON.stringify(answers, null, 2));
      
      console.log(`✅ Generated ${testFile}.answer.json with ${Object.keys(answers).length} answers`);
      
      const highConfidenceCount = results.filter(r => r.result.confidence > 0.7).length;
      const mediumConfidenceCount = results.filter(r => r.result.confidence > 0.4 && r.result.confidence <= 0.7).length;
      const lowConfidenceCount = results.filter(r => r.result.confidence <= 0.4).length;
      
      console.log(`📊 Summary for ${testFile}:`);
      console.log(`  High confidence (>70%): ${highConfidenceCount}`);
      console.log(`  Medium confidence (40-70%): ${mediumConfidenceCount}`);
      console.log(`  Low confidence (≤40%): ${lowConfidenceCount}`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error processing ${testFile}:`, error);
    }
  }
  
  console.log('🎉 Answer generation complete! All private test answer files have been generated.');
}

generateAnswersForPrivateTests().catch(console.error);