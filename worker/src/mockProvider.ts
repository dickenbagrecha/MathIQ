/**
 * Development-only mock provider for MathIQ local testing.
 * Only activates when apiKey is missing or when explicitly running in local dev mode.
 * Strictly adheres to the streaming text and JSON contracts required by MathIQ.
 */
import type { AnthropicCallParams, AnthropicCallResult } from './anthropic';
import type { Course, Topic } from './courses';

function streamString(text: string, chunkSize = 16, delayMs = 15): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (index >= text.length) {
        controller.close();
        return;
      }
      const end = Math.min(index + chunkSize, text.length);
      const chunk = text.slice(index, end);
      index = end;
      controller.enqueue(encoder.encode(chunk));
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    },
  });
}

/**
 * Returns a mathematically verified walkthrough for standard test equations,
 * and a solid generic step-by-step walkthrough for arbitrary inputs.
 */
export function getMockWalkthrough(problemText: string, topic: Topic, course: Course): string {
  const normalized = problemText.replace(/\s+/g, '').toLowerCase();

  if (normalized.includes('x^2-5x+6=0') || normalized.includes('x^{2}-5x+6=0')) {
    return `### Step 1 — Identify the equation type and form

We are asked to solve the quadratic equation:
$$x^2 - 5x + 6 = 0$$

This is in standard quadratic form $ax^2 + bx + c = 0$ with:
$$a = 1, \\quad b = -5, \\quad c = 6$$

### Step 2 — Factor the quadratic trinomial

We seek two integers $r$ and $s$ such that:
$$r + s = b = -5$$
$$r \\cdot s = c = 6$$

The integer pairs that multiply to $6$ are $(1, 6)$, $(-1, -6)$, $(2, 3)$, and $(-2, -3)$. Testing the sum:
$$(-2) + (-3) = -5$$

Thus, the quadratic factors cleanly as:
$$(x - 2)(x - 3) = 0$$

### Step 3 — Apply the Zero Product Property

Set each factor equal to zero:
$$x - 2 = 0 \\implies x = 2$$
$$x - 3 = 0 \\implies x = 3$$

### Step 4 — Check solutions

Substitute $x = 2$:
$$2^2 - 5(2) + 6 = 4 - 10 + 6 = 0 \\quad \\checkmark$$

Substitute $x = 3$:
$$3^2 - 5(3) + 6 = 9 - 15 + 6 = 0 \\quad \\checkmark$$

**Answer:** $x = 2, \\quad x = 3$
*Trigger to remember:* When factoring monic quadratics $x^2 + bx + c = 0$, look for two numbers that multiply to $c$ and sum to $b$, then apply the zero product property.`;
  }

  if (normalized.includes('x^3+2x^2-4x') || normalized.includes('x^{3}+2x^{2}-4x')) {
    return `### Step 1 — Identify the expression and differentiation rule

We want to differentiate the polynomial with respect to $x$:
$$f(x) = x^3 + 2x^2 - 4x$$

By the linearity of differentiation and the power rule:
$$\\frac{d}{dx}[x^n] = n x^{n-1}$$

### Step 2 — Differentiate term by term

1. For the first term $x^3$:
   $$\\frac{d}{dx}[x^3] = 3x^{3-1} = 3x^2$$

2. For the second term $2x^2$:
   $$\\frac{d}{dx}[2x^2] = 2(2x^{2-1}) = 4x$$

3. For the third term $-4x$:
   $$\\frac{d}{dx}[-4x] = -4(1) = -4$$

### Step 3 — Combine the differentiated terms

Summing the derivatives of each term:
$$f'(x) = 3x^2 + 4x - 4$$

**Answer:** $3x^2 + 4x - 4$
*Trigger to remember:* Apply the power rule term-by-term to polynomials: pull down each exponent as a multiplier and reduce the power by 1.`;
  }

  if (normalized.includes('\\int2x') || normalized.includes('int2x') || normalized.includes('2xdx')) {
    return `### Step 1 — Identify the integrand and integration rule

We want to evaluate the indefinite integral:
$$\\int 2x \\, dx$$

Using the constant multiple rule:
$$\\int 2x \\, dx = 2 \\int x \\, dx$$

### Step 2 — Apply the power rule for integration

The power rule states that for any $n \\ne -1$:
$$\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C$$

Here $n = 1$:
$$\\int x^1 \\, dx = \\frac{x^{1+1}}{1+1} = \\frac{x^2}{2}$$

### Step 3 — Multiply constants and include the constant of integration

$$2 \\cdot \\left(\\frac{x^2}{2}\\right) + C = x^2 + C$$

**Answer:** $x^2 + C$
*Trigger to remember:* For power integrals $\\int x^n \\, dx$, increase the exponent by 1 and divide by the new exponent, never forgetting the constant of integration $+ C$.`;
  }

  // Calculus II: Integration by Parts
  if (normalized.includes('xe^x') || normalized.includes('x\\cdot e^x') || normalized.includes('x^2\\ln x') || normalized.includes('x^2lnx')) {
    return `### Step 1 — Apply Integration by Parts

We want to evaluate the indefinite integral:
$$\\int x e^x \\, dx$$

Using the formula for integration by parts:
$$\\int u \\, dv = uv - \\int v \\, du$$

### Step 2 — Assign parts via LIATE

Choose $u = x$ (algebraic) and $dv = e^x \\, dx$ (exponential):
$$du = dx, \\quad v = \\int e^x \\, dx = e^x$$

### Step 3 — Substitute and integrate remaining term

$$\\int x e^x \\, dx = x e^x - \\int e^x \\, dx = x e^x - e^x + C = (x - 1)e^x + C$$

**Answer:** $(x - 1)e^x + C$
*Trigger to remember:* When an algebraic term multiplies an exponential, pick $u$ to be the algebraic term so its derivative simplifies. Never omit $+ C$.`;
  }
  if (normalized.includes('det') || normalized.includes('determinant') || normalized.includes('\\begin{matrix}1&2\\\\3&4\\end{matrix}') || normalized.includes('[[1,2],[3,4]]')) {
    return `### Step 1 — Identify the matrix and determinant formula

We are asked to evaluate the determinant of the $2 \\times 2$ matrix:
$$A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$$

For any $2 \\times 2$ matrix $M = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$, the determinant is defined as:
$$\\det(M) = ad - bc$$

### Step 2 — Compute the cross-products

Identify elements:
$$a = 1, \\quad b = 2, \\quad c = 3, \\quad d = 4$$

Calculate the principal diagonal product and the antidiagonal product:
$$ad = (1)(4) = 4$$
$$bc = (2)(3) = 6$$

### Step 3 — Subtract to obtain the final determinant

$$\\det(A) = 4 - 6 = -2$$

**Answer:** $-2$
*Trigger to remember:* For a $2 \\times 2$ matrix, determinant is always "main diagonal minus off diagonal": $ad - bc$.`;
  }

  // Differential Equations: First-order separable ODE dy/dx = x/y
  if (normalized.includes('dy/dx=x/y') || normalized.includes('dy/dx=x') || normalized.includes('y\'=x/y')) {
    return `### Step 1 — Classify the differential equation

We consider the first-order ordinary differential equation:
$$\\frac{dy}{dx} = \\frac{x}{y}$$

This is a **separable ODE** of the form $\\frac{dy}{dx} = g(x)h(y)$, which can be rewritten with all $y$ terms on the left and all $x$ terms on the right.

### Step 2 — Separate variables

Multiply both sides by $y \\, dx$:
$$y \\, dy = x \\, dx$$

### Step 3 — Integrate both sides

Integrate each side with respect to its variable:
$$\\int y \\, dy = \\int x \\, dx$$

Applying the power rule for integration on both sides:
$$\\frac{y^2}{2} = \\frac{x^2}{2} + C_1$$

### Step 4 — Express in standard form

Multiply throughout by $2$:
$$y^2 = x^2 + 2C_1$$

Letting $C = 2C_1$, we obtain:
$$y^2 - x^2 = C \\quad \\text{or} \\quad y(x) = \\pm \\sqrt{x^2 + C}$$

This defines a family of orthogonal hyperbolas.

**Answer:** $y^2 - x^2 = C$
*Trigger to remember:* When an ODE can be separated into $h(y)dy = g(x)dx$, separate variables immediately, integrate both sides, and aggregate the constants.`;
  }

  // Probability & Statistics: Standard Normal Z-score
  if (normalized.includes('z=') || normalized.includes('z-score') || normalized.includes('normal') || normalized.includes('\\mu') || normalized.includes('sigma')) {
    return `### Step 1 — State the Z-score formula

For a normal distribution with mean $\\mu$ and standard deviation $\\sigma$, the standardization formula ($Z$-score) for an observation $X$ is:
$$Z = \\frac{X - \\mu}{\\sigma}$$

### Step 2 — Substitute the parameters

Suppose $X = 85$, $\\mu = 75$, and $\\sigma = 5$:
$$Z = \\frac{85 - 75}{5} = \\frac{10}{5} = 2.0$$

### Step 3 — Interpret the result

A $Z$-score of $+2.0$ signifies that the observation lies exactly $2$ standard deviations above the population mean. By the empirical rule ($68-95-99.7$), approximately $97.7\\%$ of values lie below this threshold ($P(Z \\le 2.0) \\approx 0.9772$).

**Answer:** $Z = 2.0$ (or $P(Z \\le 2) \\approx 0.9772$)
*Trigger to remember:* The $Z$-score measures standard deviations from the mean: $Z = \\frac{X - \\mu}{\\sigma}$.`;
  }

  // Generic canonical fallback for any topic
  // Extract trailing equation/answer or default to verified
  const dollarMatch = topic.exampleProblem.match(/\$([^$]+)\$/g);
  let cleanAnswer = 'Solution verified';
  if (dollarMatch && dollarMatch.length > 0) {
    cleanAnswer = dollarMatch[dollarMatch.length - 1].replace(/\$/g, '');
  } else {
    cleanAnswer = topic.exampleProblem.replace(/.*?=\s*/, '').replace(/[$.]/g, '').trim();
  }
  const formattedAnswer = `$${cleanAnswer}$`;

  return `### Step 1 — Understand the problem setup

We are solving:
$$${problemText.trim() || topic.exampleProblem}$$

in the context of **${topic.title}** (${course.title}).

**Strategic Anchor:** ${topic.strategicAnchor}

### Step 2 — Execute the canonical mathematical solution

Applying the fundamental principles of ${topic.title}:
1. Identify known quantities and expressions.
2. Transform and simplify the expression according to standard algebraic / calculus rules.
3. Compute the intermediate step-by-step operations carefully.

### Step 3 — State the result

The operations yield the evaluated canonical solution.

**Answer:** ${formattedAnswer}
*Trigger to remember:* ${topic.strategicAnchor}`;
}

export function mockAnthropicCall(params: AnthropicCallParams): AnthropicCallResult {
  const problemText = params.problem?.trim() || params.topic.exampleProblem;
  const solution = getMockWalkthrough(problemText, params.topic, params.course);

  if (params.onUsage) {
    void params.onUsage({
      input_tokens: 150,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 1200,
      output_tokens: 380,
    });
  }

  return {
    ok: true,
    status: 200,
    body: streamString(solution),
  };
}

export function mockClassifyProblem(problem: string): { courseId: string; topicId: string } {
  const norm = problem.toLowerCase();
  if (norm.includes('deriv') || norm.includes('d/dx') || norm.includes('differentiate')) {
    return { courseId: 'calc-1', topicId: 'differentiation-rules' };
  }
  if (norm.includes('dy/dx') || norm.includes('ode') || norm.includes('differential eq')) {
    return { courseId: 'differential-equations', topicId: 'separable' };
  }
  if (norm.includes('int') || norm.includes('\\int') || norm.includes('dx')) {
    return { courseId: 'calc-1', topicId: 'antiderivatives-ftc' };
  }
  if (norm.includes('matrix') || norm.includes('eigen') || norm.includes('det') || norm.includes('vector')) {
    return { courseId: 'linear-algebra', topicId: 'determinants' };
  }
  if (norm.includes('probability') || norm.includes('permut') || norm.includes('combin') || norm.includes('ways') || norm.includes('count')) {
    return { courseId: 'combinatorics', topicId: 'permutations-combinations' };
  }
  if (norm.includes('logic') || norm.includes('induction') || norm.includes('proof') || norm.includes('relation')) {
    return { courseId: 'discrete', topicId: 'proof-techniques' };
  }
  return { courseId: 'algebra', topicId: 'factoring-quadratics' };
}

