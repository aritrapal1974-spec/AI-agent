const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware to parse JSON
app.use(express.json());

/**
 * =====================================
 * CALCULATOR AGENT ENDPOINT - POST /agent
 * =====================================
 */
app.post('/agent', (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);
    // Destructure query and assets from request body
    // Default assets to empty array if not provided
    const { query, assets = [] } = req.body;

    // Validate that query exists and is a string
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        output: 'Error: "query" is required and must be a non-empty string.'
      });
    }

    // Note: assets is accepted but not processed
    // (placeholder for future file/URL processing)

    // Calculate the expression
    const output = calculateExpression(query);

    // Return response with 'output' key (API contract requirement)
    return res.status(200).json({ output });

  } catch (error) {
    // Return errors with 'output' key for strict API compliance
    console.error('Error processing request:', error);
    return res.status(500).json({
      output: 'Internal server error: Unable to process your request.'
    });
  }
});

/**
 * ===================================================================
 * NATURAL LANGUAGE CALCULATOR
 * ===================================================================
 * Converts natural language queries into math expressions and
 * safely evaluates them without using eval().
 * 
 * Supports:
 *   - Operator words: plus, minus, times, divided by, power, mod
 *   - Structured phrases: "product of X and Y", "sum of X and Y"
 *   - Integers and decimals (including negative numbers)
 *   - Complex expressions: 10 + 5 * 2
 * ===================================================================
 */

/**
 * Convert natural language query into mathematical expression
 * @param {string} query - Natural language math query
 * @returns {string} - Mathematical expression or error message
 */
function calculateExpression(query) {
  // Step 1: Validate query
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return 'Query is required.';
  }

  const normalizedQuery = query.toLowerCase().trim();

  // Step 2: Convert natural language to math expression
  let mathExpression = convertNaturalLanguageToMath(normalizedQuery);

  if (!mathExpression) {
    return 'I could not understand the query.';
  }

  // Step 3: Safely evaluate the expression
  const result = safeEvaluate(mathExpression);

  if (result === null) {
    return 'I could not understand the query.';
  }

  if (result.error) {
    return result.error;
  }

  // Step 4: Format and return natural language response
  return formatResult(result.value, result.operation);
}

/**
 * Convert natural language phrases to mathematical operators
 * @param {string} query - Normalized query string
 * @returns {string|null} - Mathematical expression
 */
function convertNaturalLanguageToMath(query) {
  // Remove filler words
  let cleaned = query
    .replace(/\bwhat\s+is\b/g, '')
    .replace(/\bcalculate\b/g, '')
    .replace(/\bfind\b/g, '')
    .replace(/\bplease\b/g, '')
    .replace(/\bcompute\b/g, '')
    .replace(/\b\?\s*$/g, '') // Remove trailing question mark
    .trim();

  // Handle structured phrases: "product of A and B", "sum of A and B", etc.
  const structuredPatterns = [
    { pattern: /product\s+of\s+([\d.]+)\s+and\s+([\d.]+)/gi, operator: '*', name: 'product' },
    { pattern: /sum\s+of\s+([\d.]+)\s+and\s+([\d.]+)/gi, operator: '+', name: 'sum' },
    { pattern: /difference\s+of\s+([\d.]+)\s+and\s+([\d.]+)/gi, operator: '-', name: 'difference' },
    { pattern: /quotient\s+of\s+([\d.]+)\s+and\s+([\d.]+)/gi, operator: '/', name: 'quotient' },
  ];

  for (const { pattern, operator } of structuredPatterns) {
    const match = cleaned.match(pattern);
    if (match) {
      return cleaned.replace(pattern, `$1 ${operator} $2`);
    }
  }

  // Convert operator words to symbols
  let expression = cleaned
    // Handle "divided by" and "divided" before single "d"
    .replace(/\s+divided\s+by\s+/gi, ' / ')
    .replace(/\s+multiplied\s+by\s+/gi, ' * ')
    // Single word operators
    .replace(/\bplus\b/gi, '+')
    .replace(/\bminus\b/gi, '-')
    .replace(/\btimes\b/gi, '*')
    .replace(/\bdivide\b/gi, '/')
    .replace(/\bmod\b/gi, '%')
    .replace(/\bmodulo\b/gi, '%')
    .replace(/\bpower\b/gi, '^')
    .replace(/\braised\s+to\b/gi, '^')
    .replace(/\bsquared\b/gi, '^ 2')
    .replace(/\bcubed\b/gi, '^ 3')
    .trim();

  // Validate expression contains at least one operator and numbers
  if (!/[\d.]+\s*[+\-*/%^]\s*[\d.]+/.test(expression)) {
    return null;
  }

  return expression;
}

/**
 * Safely evaluate mathematical expressions without using eval()
 * Supports: +, -, *, /, %, ^ with proper order of operations
 * 
 * @param {string} expression - Mathematical expression (e.g., "10 + 5 * 2")
 * @returns {object} - { value: number, operation: string, error: null } or { error: string, value: null, operation: null }
 */
function safeEvaluate(expression) {
  // Sanitize: remove spaces and ensure valid characters only
  const sanitized = expression.replace(/\s+/g, '');

  // Validate: only numbers, operators, and parentheses allowed
  if (!/^[-]?[\d.+\-*/%^()]+$/.test(sanitized)) {
    return { error: 'Invalid expression.', value: null, operation: null };
  }

  try {
    // Parse and evaluate with proper order of operations
    const result = evaluateExpression(sanitized);

    if (isNaN(result)) {
      return { error: 'Invalid expression.', value: null, operation: null };
    }

    // Determine operation type from expression
    const operation = detectOperation(sanitized);

    return { value: result, operation, error: null };
  } catch (error) {
    return { error: 'Cannot divide by zero.', value: null, operation: null };
  }
}

/**
 * Evaluate mathematical expression with proper order of operations
 * Respects: Exponentiation (^) > Multiplication/Division (*, /, %) > Addition/Subtraction (+, -)
 * 
 * @param {string} expr - Sanitized expression
 * @returns {number} - Result
 */
function evaluateExpression(expr) {
  // Handle exponentiation (highest priority)
  expr = expr.replace(/(-?\d+\.?\d*)\^(-?\d+\.?\d*)/g, (match, base, exp) => {
    return Math.pow(parseFloat(base), parseFloat(exp));
  });

  // Handle multiplication, division, modulo (medium priority)
  expr = expr.replace(/(-?\d+\.?\d*)[*/%](-?\d+\.?\d*)/g, (match, num1, operator, num2) => {
    const a = parseFloat(num1);
    const b = parseFloat(num2);

    if (operator === '*') return a * b;
    if (operator === '/') {
      if (b === 0) throw new Error('Division by zero');
      return a / b;
    }
    if (operator === '%') {
      if (b === 0) throw new Error('Division by zero');
      return a % b;
    }
  });

  // Handle addition, subtraction (lowest priority)
  expr = expr.replace(/(-?\d+\.?\d*)[+-](-?\d+\.?\d*)/g, (match, num1, operator, num2) => {
    const a = parseFloat(num1);
    const b = parseFloat(num2);

    if (operator === '+') return a + b;
    if (operator === '-') return a - b;
  });

  return parseFloat(expr);
}

/**
 * Detect the primary operation in an expression
 * @param {string} expr - Sanitized expression
 * @returns {string} - Operation name
 */
function detectOperation(expr) {
  // Check in order of lowest to highest precedence (since we evaluate those last)
  if (/[+]/.test(expr) && !expr.match(/^-/)) return 'sum';
  if (/-(?!^\-)/.test(expr)) return 'difference';
  if (/\*/.test(expr)) return 'product';
  if (/\//.test(expr)) return 'quotient';
  if (/%/.test(expr)) return 'remainder';
  if (/\^/.test(expr)) return 'power';
  return 'result';
}

/**
 * Format calculation result into natural language
 * @param {number} value - Calculated result
 * @param {string} operation - Type of operation
 * @returns {string} - Formatted response
 */
function formatResult(value, operation) {
  // Format number: remove unnecessary decimals
  const formatted = Number.isInteger(value) ? value : parseFloat(value.toFixed(2));

  const operationNames = {
    'sum': 'sum',
    'difference': 'difference',
    'product': 'product',
    'quotient': 'quotient',
    'remainder': 'remainder',
    'power': 'power'
  };

  const opName = operationNames[operation] || 'result';
  return `The ${opName} is ${formatted}.`;
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

/**
 * Start the server
 */
app.listen(PORT, () => {
  console.log(`🚀 Agent Server running on port ${PORT}`);
  console.log(`📍 POST /agent - Main endpoint for agent queries`);
  console.log(`💚 GET /health - Health check endpoint`);
});
