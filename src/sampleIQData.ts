import { type IQTestQuestion } from './types';

export const SAMPLE_SEQUENCE_QUESTIONS: IQTestQuestion[] = [
  {
    id: 1001,
    stem: "2, 4, 6, 8, ?",
    options: ["9", "10", "11", "12"],
    category: "sequence"
  },
  {
    id: 1002,
    stem: "1, 1, 2, 3, 5, ?",
    options: ["7", "8", "9", "10"],
    category: "sequence"
  },
  {
    id: 1003,
    stem: "5, 10, 20, 40, ?",
    options: ["60", "70", "80", "90"],
    category: "sequence"
  },
  {
    id: 1004,
    stem: "1, 4, 9, 16, ?",
    options: ["20", "24", "25", "30"],
    category: "sequence"
  },
  {
    id: 1005,
    stem: "3, 6, 12, 24, ?",
    options: ["36", "40", "48", "50"],
    category: "sequence"
  },
  {
    id: 1006,
    stem: "100, 81, 64, 49, ?",
    options: ["36", "40", "42", "45"],
    category: "sequence"
  },
  {
    id: 1007,
    stem: "2, 6, 18, 54, ?",
    options: ["108", "148", "162", "180"],
    category: "sequence"
  },
  {
    id: 1008,
    stem: "1, 8, 27, 64, ?",
    options: ["100", "125", "144", "180"],
    category: "sequence"
  },
  {
    id: 1009,
    stem: "7, 14, 28, 56, ?",
    options: ["84", "98", "112", "128"],
    category: "sequence"
  },
  {
    id: 1010,
    stem: "1/2, 1/4, 1/8, 1/16, ?",
    options: ["1/20", "1/24", "1/32", "1/36"],
    category: "sequence"
  },
  {
    id: 1011,
    stem: "5, 13, 37, 85, ?",
    options: ["165", "167", "168", "169"],
    category: "sequence"
  },
  {
    id: 1012,
    stem: "1, 1, 3/2, 2/3, 5/4, ?",
    options: ["4/5", "6/7", "1/5", "7/6"],
    category: "sequence"
  },
  {
    id: 1013,
    stem: "0, 4, 15, 47, ?",
    options: ["64", "94", "142", "156"],
    category: "sequence"
  },
  {
    id: 1014,
    stem: "-1, 1, 3, 29, ?",
    options: ["841", "843", "24389", "24391"],
    category: "sequence"
  },
  {
    id: 1015,
    stem: "0, 1, 4, 11, 26, 57, ?",
    options: ["120", "174", "200", "247"],
    category: "sequence"
  },
  {
    id: 1016,
    stem: "129, 107, 73, 17, -73, ?",
    options: ["-161", "-203", "-245", "-287"],
    category: "sequence"
  }
];

export const SAMPLE_ANSWERS = {
  "1001": { answer: [3], hint: "This is an arithmetic sequence with a common difference of +2" },
  "1002": { answer: [1], hint: "Fibonacci sequence: each number is the sum of the two preceding numbers" },
  "1003": { answer: [2], hint: "Geometric sequence: each number is multiplied by 2" },
  "1004": { answer: [2], hint: "Perfect squares: 1², 2², 3², 4², 5² = 25" },
  "1005": { answer: [2], hint: "Geometric sequence: each number is multiplied by 2" },
  "1006": { answer: [0], hint: "Perfect squares in descending order: 10², 9², 8², 7², 6² = 36" },
  "1007": { answer: [2], hint: "Geometric sequence: each number is multiplied by 3" },
  "1008": { answer: [1], hint: "Perfect cubes: 1³, 2³, 3³, 4³, 5³ = 125" },
  "1009": { answer: [3], hint: "Geometric sequence: each number is multiplied by 2" },
  "1010": { answer: [2], hint: "Geometric sequence: each fraction is divided by 2" },
  "1011": { answer: [1], hint: "Pattern: multiply by 3 and add 2 repeatedly" },
  "1012": { answer: [1], hint: "Alternating pattern in numerators and denominators" },
  "1013": { answer: [2], hint: "Pattern: n³ - n where n increases" },
  "1014": { answer: [0], hint: "Pattern: square the previous number and subtract 1" },
  "1015": { answer: [3], hint: "A<sub>n+1</sub> - A<sub>n</sub> = B<sub>n</sub>, where B<sub>n</sub> = 1,3,7,15,31,63,... (each B<sub>n+1</sub> = 2×B<sub>n</sub> + 1)" },
  "1016": { answer: [0], hint: "A<sub>n+1</sub> - A<sub>n</sub> = B<sub>n</sub>, B<sub>n+1</sub> - B<sub>n</sub> = 1,2,3,5,8,13 (Fibonacci), Differences: -22,-34,-56,-90,-144" },
  "2001": { answer: [1], hint: "Book is used for reading, fork is used for eating" },
  "2002": { answer: [3], hint: "Triangle, square, and circle are shapes; angle is not a complete shape" },
  "2003": { answer: [1], hint: "Happy and sad are opposites, up and down are opposites" },
  "2004": { answer: [1], hint: "Some roses may fade quickly because all roses are flowers and some flowers fade quickly" },
  "2005": { answer: [1], hint: "Dog is to puppy as cat is to kitten - adult to baby relationship" },
  "3001": { answer: [1], hint: "The pattern alternates between circle and triangle" },
  "3002": { answer: [2], hint: "The sequence repeats: square, circle, triangle" },
  "3003": { answer: [0], hint: "A flat pattern that folds into a 3D shape with 6 faces would be a cube" },
  "3004": { answer: [2], hint: "Count all triangles including those formed by overlapping lines" },
  "3005": { answer: [1], hint: "Look for the piece that completes the missing section of the puzzle" }
};

export const SAMPLE_VERBAL_QUESTIONS: IQTestQuestion[] = [
  {
    id: 2001,
    stem: "BOOK is to READING as FORK is to ?",
    options: ["KITCHEN", "EATING", "SPOON", "FOOD"],
    category: "verbal"
  },
  {
    id: 2002,
    stem: "Which word does NOT belong with the others?",
    options: ["TRIANGLE", "SQUARE", "CIRCLE", "ANGLE"],
    category: "verbal"
  },
  {
    id: 2003,
    stem: "HAPPY is to SAD as UP is to ?",
    options: ["OVER", "DOWN", "ACROSS", "AROUND"],
    category: "verbal"
  },
  {
    id: 2004,
    stem: "If all roses are flowers and some flowers fade quickly, then:",
    options: ["All roses fade quickly", "Some roses may fade quickly", "No roses fade quickly", "All flowers are roses"],
    category: "logic"
  },
  {
    id: 2005,
    stem: "DOG is to PUPPY as CAT is to ?",
    options: ["MOUSE", "KITTEN", "PET", "ANIMAL"],
    category: "verbal"
  }
];

export const SAMPLE_DIAGRAM_QUESTIONS: IQTestQuestion[] = [
  {
    id: 3001,
    stem: "Complete the pattern: ○ △ ○ △ ?",
    options: ["○", "△", "□", "◇"],
    category: "diagram"
  },
  {
    id: 3002,
    stem: "Which shape comes next in the sequence: □ ○ △ □ ○ ?",
    options: ["□", "○", "△", "◇"],
    category: "diagram"
  },
  {
    id: 3003,
    stem: "If you fold the pattern, which 3D shape would you get?",
    options: ["Cube", "Pyramid", "Cylinder", "Cone"],
    category: "diagram"
  },
  {
    id: 3004,
    stem: "How many triangles are in this figure? (Imagine a triangle divided into smaller triangles)",
    options: ["6", "8", "10", "12"],
    category: "diagram"
  },
  {
    id: 3005,
    stem: "Which piece completes the puzzle?",
    options: ["Piece A", "Piece B", "Piece C", "Piece D"],
    category: "diagram"
  },
  {
    id: 3006,
    stem: "Which larger shape would be made if the two sections are fitted together? ![](data/T1-105-public/media/1.png)",
    options: [
      "Option A: ![](data/T1-105-public/media/1A.png)",
      "Option B: ![](data/T1-105-public/media/1B.png)", 
      "Option C: ![](data/T1-105-public/media/1C.png)",
      "Option D: ![](data/T1-105-public/media/1D.png)"
    ],
    category: "diagram"
  },
  {
    id: 3007,
    stem: "How many four-sided figures appear in the diagram below? ![](data/T1-105-public/media/2.png)",
    options: ["10", "16", "22", "25"],
    category: "diagram"
  },
  {
    id: 3008,
    stem: "Which of the figures below best completes the series? ![](data/T1-105-public/media/3.png)",
    options: [
      "A: ![](data/T1-105-public/media/3A.png)",
      "B: ![](data/T1-105-public/media/3B.png)",
      "C: ![](data/T1-105-public/media/3C.png)",
      "D: ![](data/T1-105-public/media/3D.png)"
    ],
    category: "diagram"
  }
];

export function getAllSampleQuestions(): IQTestQuestion[] {
  return [
    ...SAMPLE_SEQUENCE_QUESTIONS,
    ...SAMPLE_VERBAL_QUESTIONS,
    ...SAMPLE_DIAGRAM_QUESTIONS
  ];
}

export function getRandomSampleQuestions(count: number = 10): IQTestQuestion[] {
  const allQuestions = getAllSampleQuestions();
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getSampleAnswers() {
  return SAMPLE_ANSWERS;
}

export function getQuestionsWithSampleAnswers(count: number = 10): {questions: IQTestQuestion[], answers: Record<string, { answer: number[], hint: string }>} {
  const questions = getRandomSampleQuestions(count);
  const relevantAnswers: Record<string, { answer: number[], hint: string }> = {};
  
  questions.forEach(q => {
    if (SAMPLE_ANSWERS[q.id.toString() as keyof typeof SAMPLE_ANSWERS]) {
      relevantAnswers[q.id.toString()] = SAMPLE_ANSWERS[q.id.toString() as keyof typeof SAMPLE_ANSWERS];
    }
  });
  
  return { questions, answers: relevantAnswers };
}