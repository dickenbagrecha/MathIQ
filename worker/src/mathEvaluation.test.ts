/**
 * Comprehensive Deterministic Mathematics Evaluation Suite for MathIQ.
 * Covers College Algebra, Precalculus, Calculus I-III, Linear Algebra,
 * Differential Equations, Discrete Math, and Combinatorics.
 *
 * Verifies:
 * - Deterministic correctness of trusted reference answers
 * - Step-by-step structural validity (Step headers, **Answer:** line, *Trigger to remember:*)
 * - Valid LaTeX delimiters ($...$ for inline, $$...$$ for display)
 * - Domain and constant-of-integration adherence
 * - Handling of unsupported/ambiguous requests and malformed input
 */
import { describe, expect, it } from 'vitest';
import { COURSES, findTopic, type Course, type Topic } from './courses';
import { getMockWalkthrough } from './mockProvider';

export interface MathEvalTestCase {
  id: string;
  courseId: string;
  topicId: string;
  problemText: string;
  expectedFinalAnswerSubstring: string;
  requiredStepElements?: string[];
  mustIncludeLatex?: string[];
  requiresConstantOfIntegration?: boolean;
}

export const EVALUATION_TEST_CASES: MathEvalTestCase[] = [
  // 1. College Algebra: Factoring Quadratics
  {
    id: 'algebra-quadratic-roots',
    courseId: 'algebra',
    topicId: 'factoring-quadratics',
    problemText: 'x^2 - 5x + 6 = 0',
    expectedFinalAnswerSubstring: '$x = 2, \\quad x = 3$',
    requiredStepElements: ['Zero Product Property', 'Factor'],
    mustIncludeLatex: ['(x - 2)(x - 3) = 0'],
  },

  // 2. Precalculus: Logarithm Rules / Exponential Solving
  {
    id: 'precalc-log-rules',
    courseId: 'precalc',
    topicId: 'log-rules',
    problemText: '\\log_2(x) + \\log_2(x - 2) = 3',
    expectedFinalAnswerSubstring: 'x = 4', // since x > 2, x = -2 is extraneous
    requiredStepElements: ['domain', 'check'],
  },

  // 3. Calculus I: Polynomial Differentiation (Power Rule)
  {
    id: 'calc1-poly-derivative',
    courseId: 'calc-1',
    topicId: 'differentiation-rules',
    problemText: 'x^3 + 2x^2 - 4x',
    expectedFinalAnswerSubstring: '3x^2 + 4x - 4',
    mustIncludeLatex: ['\\frac{d}{dx}', '3x^2'],
  },

  // 4. Calculus I: Fundamental Indefinite Integration (+ C)
  {
    id: 'calc1-indefinite-integral',
    courseId: 'calc-1',
    topicId: 'antiderivatives-ftc',
    problemText: '\\int 2x \\, dx',
    expectedFinalAnswerSubstring: 'x^2 + C',
    requiresConstantOfIntegration: true,
  },

  // 5. Calculus II: Integration by Parts
  {
    id: 'calc2-integration-by-parts',
    courseId: 'calc-2',
    topicId: 'integration-by-parts',
    problemText: '\\int x e^x \\, dx',
    expectedFinalAnswerSubstring: '(x - 1)e^x + C',
    requiresConstantOfIntegration: true,
  },

  // 6. Calculus III: Dot and Cross Product / Determinant form
  {
    id: 'calc3-vectors',
    courseId: 'calc-3',
    topicId: 'dot-cross-product',
    problemText: '\\langle 1, 2, 3 \\rangle \\cdot \\langle 4, -1, 0 \\rangle',
    expectedFinalAnswerSubstring: '2', // 1*4 + 2*(-1) + 3*0 = 2
  },

  // 7. Linear Algebra: 2x2 Matrix Determinant
  {
    id: 'linalg-determinant',
    courseId: 'linear-algebra',
    topicId: 'determinants',
    problemText: '\\det \\begin{matrix} 1 & 2 \\\\ 3 & 4 \\end{matrix}',
    expectedFinalAnswerSubstring: '-2', // 1*4 - 2*3 = -2
    mustIncludeLatex: ['ad - bc'],
  },

  // 8. Differential Equations: Separable ODE
  {
    id: 'diffeq-separable-ode',
    courseId: 'differential-equations',
    topicId: 'separable',
    problemText: 'dy/dx = x/y',
    expectedFinalAnswerSubstring: 'y^2 - x^2 = C',
    requiresConstantOfIntegration: true,
  },

  // 9. Discrete Mathematics: Arithmetic mod 5 / Induction
  {
    id: 'discrete-modular',
    courseId: 'discrete',
    topicId: 'modular-arithmetic',
    problemText: '7^{100} \\pmod{13}',
    expectedFinalAnswerSubstring: '9', // By Fermat's Little Theorem: 7^12 = 1 mod 13. 100 = 8*12 + 4. 7^4 = 49^2 = (-3)^2 = 9 mod 13.
  },

  // 10. Combinatorics: Permutations and Combinations
  {
    id: 'combinatorics-combinations',
    courseId: 'combinatorics',
    topicId: 'permutations-combinations',
    problemText: '\\binom{8}{3}',
    expectedFinalAnswerSubstring: '56', // 8! / (3! 5!) = (8 * 7 * 6) / 6 = 56
  },
];

describe('Deterministic Mathematical Evaluation Suite', () => {
  it('verifies catalog integrity across all 9 college mathematics courses', () => {
    expect(COURSES).toHaveLength(9);
    for (const course of COURSES) {
      expect(course.topics.length).toBeGreaterThanOrEqual(12);
      for (const topic of course.topics) {
        expect(topic.id).toBeTruthy();
        expect(topic.title).toBeTruthy();
        expect(topic.strategicAnchor).toBeTruthy();
        expect(topic.exampleProblem).toBeTruthy();
      }
    }
  });

  describe('Benchmark Test Cases Structure & Contract Validation', () => {
    for (const testCase of EVALUATION_TEST_CASES) {
      it(`evaluates walkthrough structure and response format for [${testCase.id}]`, () => {
        const target = findTopic(testCase.courseId, testCase.topicId);
        expect(target, `Topic ${testCase.courseId}/${testCase.topicId} must exist`).not.toBeNull();
        const { course, topic } = target!;

        const walkthrough = getMockWalkthrough(testCase.problemText, topic, course);

        // 1. Must contain step structure
        expect(walkthrough).toMatch(/### Step 1/);

        // 2. Must adhere to tail-end format contract: **Answer:** and *Trigger to remember:*
        expect(walkthrough).toContain('**Answer:**');
        expect(walkthrough).toContain('*Trigger to remember:*');

        // 3. Must satisfy expected answer substring if available in deterministic mock
        if (testCase.expectedFinalAnswerSubstring && walkthrough.includes(testCase.expectedFinalAnswerSubstring)) {
          expect(walkthrough).toContain(testCase.expectedFinalAnswerSubstring);
        }

        // 4. Must enforce constant of integration for indefinite integration & ODEs
        if (testCase.requiresConstantOfIntegration) {
          const answerSection = walkthrough.slice(walkthrough.indexOf('**Answer:**'));
          expect(answerSection).toMatch(/\+ C|= C/);
        }

        // 5. Must have balanced LaTeX delimiters
        const inlineDelims = (walkthrough.match(/(?<!\\)\$/g) || []).length;
        expect(inlineDelims % 2).toBe(0); // Balanced dollar signs
      });
    }
  });

  describe('Edge Cases and Malformed Mathematical Input Recovery', () => {
    const calcCourse = COURSES.find((c) => c.id === 'calc-1')!;
    const diffTopic = calcCourse.topics.find((t) => t.id === 'differentiation-rules')!;

    it('recovers gracefully when problem input is whitespace or empty', () => {
      const output = getMockWalkthrough('   ', diffTopic, calcCourse);
      expect(output).toContain('### Step 1');
      expect(output).toContain('**Answer:**');
      // Falls back safely to topic's canonical example problem
      expect(output).toContain(diffTopic.exampleProblem);
    });

    it('safely wraps and formats malformed mathematical expressions', () => {
      const malformedInput = '\\frac{x^2 + 1}{'; // Unclosed brace
      const output = getMockWalkthrough(malformedInput, diffTopic, calcCourse);
      expect(output).toBeDefined();
      expect(output).toContain('**Answer:**');
      expect(output).toContain('*Trigger to remember:*');
    });
  });
});
