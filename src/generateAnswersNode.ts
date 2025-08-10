#!/usr/bin/env node
import { AIQuestionSolver } from './AIQuestionSolver';
import { type IQTestQuestion, type TestAnswers } from './types';
import * as fs from 'fs';
import * as path from 'path';

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
  const aiSolver = new AIQuestionSolver();
  const dataPath = path.join(__dirname, 'Requirements', 'data');
  
  console.log('🤖 Starting AI-powered answer generation for private test data...\n');
  
  for (const testFile of PRIVATE_TEST_FILES) {
    try {
      console.log(`📝 Processing: ${testFile}.json`);
      
      // Load test questions
      const testFilePath = path.join(dataPath, `${testFile}.json`);
      
      if (!fs.existsSync(testFilePath)) {
        console.log(`⚠️  File not found: ${testFilePath}, skipping...`);
        continue;
      }
      
      const questionsData = fs.readFileSync(testFilePath, 'utf-8');
      const questions: IQTestQuestion[] = JSON.parse(questionsData);
      
      // Generate answers
      const answers: TestAnswers = {};
      const results: Array<{question: IQTestQuestion, result: any}> = [];
      
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        console.log(`  🔍 Solving question ${question.id}: ${question.stem.substring(0, 50)}...`);
        
        const solverResult = await aiSolver.solveQuestion(question);
        
        answers[question.id.toString()] = {
          answer: [solverResult.answer],
          hint: solverResult.reasoning
        };
        
        results.push({ question, result: solverResult });
        
        // Log confidence
        const confidence = Math.round(solverResult.confidence * 100);
        console.log(`    ✅ Answer: ${solverResult.answer} (${confidence}% confidence)`);
        console.log(`    💡 Reasoning: ${solverResult.reasoning}`);
      }
      
      // Save answers to file
      const answerFilePath = path.join(dataPath, `${testFile}.answer.json`);
      fs.writeFileSync(answerFilePath, JSON.stringify(answers, null, 2));
      
      console.log(`✅ Generated ${testFile}.answer.json with ${Object.keys(answers).length} answers`);
      
      // Generate summary report
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

// Run the generation
generateAnswersForPrivateTests().catch(console.error);