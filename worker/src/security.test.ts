import { describe, expect, it } from 'vitest';
import { callAnthropicStream } from './anthropic';
import { COURSES } from './courses';
import { getIrisPrompts } from './prompt';

describe('Security & Dev/Prod Isolation', () => {
  const dummyEnv = {
    ALLOWED_ORIGINS: 'https://mathiq.io',
    IRIS_PROMPT_FOUNDATION: 'foundation',
    IRIS_PROMPT_CALC_1: 'calc1',
    IRIS_PROMPT_WHY_HOW: 'whyhow',
    IRIS_PROMPT_PRACTICE: 'practice',
    IRIS_PROMPT_INVENT: 'invent',
  };
  const prompts = getIrisPrompts(dummyEnv as any);
  const algebraCourse = COURSES[0];
  const quadTopic = algebraCourse.topics[5];

  it('fails safely and does NOT use mock provider when isDev is false and API key is missing', async () => {
    // When isDev is false (simulating production execution), a missing API key must not activate mock
    const result = await callAnthropicStream({
      apiKey: '',
      model: 'claude-haiku-4-5',
      prompts,
      course: algebraCourse,
      topic: quadTopic,
      problem: 'x^2 - 5x + 6 = 0',
      isDev: false, // Production mode!
    });

    // In production without key, it calls fetch(ANTHROPIC_URL) with empty key, returning HTTP error or failing fetch
    // Critically, it must not return isMock: true
    expect(result.isMock).not.toBe(true);
  });

  it('activates safe simulation only when explicitly configured with isDev = true', async () => {
    const result = await callAnthropicStream({
      apiKey: '',
      model: 'claude-haiku-4-5',
      prompts,
      course: algebraCourse,
      topic: quadTopic,
      problem: 'x^2 - 5x + 6 = 0',
      isDev: true,
    });

    expect(result.ok).toBe(true);
    expect(result.isMock).toBe(true);
    expect(result.body).not.toBeNull();
  });

  it('correctly classifies math problems across multiple disciplines', async () => {
    const { mockClassifyProblem } = await import('./mockProvider');
    
    // Algebra
    expect(mockClassifyProblem('Solve 3x^2 - 12 = 0')).toEqual({
      courseId: 'algebra',
      topicId: 'factoring-quadratics',
    });

    // Calculus Integral
    expect(mockClassifyProblem('Evaluate \\int 2x dx')).toEqual({
      courseId: 'calc-1',
      topicId: 'antiderivatives-ftc',
    });

    // Calculus Derivative
    expect(mockClassifyProblem('Find d/dx of x^3 + 2x')).toEqual({
      courseId: 'calc-1',
      topicId: 'differentiation-rules',
    });

    // Differential Equations
    expect(mockClassifyProblem('Solve dy/dx = x/y')).toEqual({
      courseId: 'differential-equations',
      topicId: 'separable',
    });

    // Linear Algebra
    expect(mockClassifyProblem('Find det of matrix [[1,2],[3,4]]')).toEqual({
      courseId: 'linear-algebra',
      topicId: 'determinants',
    });

    // Combinatorics / Counting
    expect(mockClassifyProblem('How many ways to choose permutations?')).toEqual({
      courseId: 'combinatorics',
      topicId: 'permutations-combinations',
    });

    // Discrete Math
    expect(mockClassifyProblem('Prove by induction that statement holds')).toEqual({
      courseId: 'discrete',
      topicId: 'proof-techniques',
    });
  });

  it('provides verified deterministic mathematical solutions for core topics', async () => {
    const { getMockWalkthrough } = await import('./mockProvider');

    // Quadratic
    const quadSol = getMockWalkthrough('x^2 - 5x + 6 = 0', quadTopic, algebraCourse);
    expect(quadSol).toContain('**Answer:** $x = 2, \\quad x = 3$');

    // Derivative
    const derivSol = getMockWalkthrough('x^3 + 2x^2 - 4x', quadTopic, algebraCourse);
    expect(derivSol).toContain('**Answer:** $3x^2 + 4x - 4$');

    // Matrix determinant
    const detSol = getMockWalkthrough('det([[1,2],[3,4]])', quadTopic, algebraCourse);
    expect(detSol).toContain('**Answer:** $-2$');

    // Differential equation
    const odeSol = getMockWalkthrough('dy/dx = x/y', quadTopic, algebraCourse);
    expect(odeSol).toContain('**Answer:** $y^2 - x^2 = C$');
  });
});
