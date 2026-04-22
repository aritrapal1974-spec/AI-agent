const express = require('express');
const math = require('mathjs');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());

/**
 * =====================================
 * POST /agent
 * =====================================
 */
app.post('/agent', (req, res) => {
  try {
    const { query, assets = [] } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        output: 'Error: "query" is required and must be a non-empty string.'
      });
    }

    const output = calculateExpression(query);
    return res.status(200).json({ output });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      output: 'Internal server error: Unable to process your request.'
    });
  }
});

/**
 * =====================================
 * MAIN CALCULATOR FUNCTION
 * =====================================
 */
function calculateExpression(query) {
  const normalized = query.toLowerCase().trim();

  const expression = convertNaturalLanguageToMath(normalized);

  if (!expression) {
    return 'I could not understand the query.';
  }

  const result = safeEvaluate(expression);

  if (result.error) return result.error;

  return formatResult(result.value, result.operation);
}

/**
 * =====================================
 * NLP → MATH CONVERSION
 * =====================================
 */
function convertNaturalLanguageToMath(query) {
  let cleaned = query
    .replace(/\bwhat\s+is\b/g, '')
    .replace(/\bcalculate\b/g, '')
    .replace(/\bfind\b/g, '')
    .replace(/\bplease\b/g, '')
    .replace(/\bcompute\b/g, '')
    .replace(/\bthe\b/g, '')
    .replace(/\bof\b/g, '')
    .replace(/\band\b/g, ' ')
    .replace(/\?\s*$/, '')
    .trim();

  // Structured phrases
  cleaned = cleaned
    .replace(/product\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/gi, '$1 * $2')
    .replace(/sum\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/gi, '$1 + $2')
    .replace(/difference\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/gi, '$1 - $2')
    .replace(/quotient\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/gi, '$1 / $2');

  // Natural phrases
  cleaned = cleaned
    .replace(/add (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)/gi, '$1 + $2')
    .replace(/subtract (\d+(?:\.\d+)?) from (\d+(?:\.\d+)?)/gi, '$2 - $1')
    .replace(/multiply (\d+(?:\.\d+)?) (by|with) (\d+(?:\.\d+)?)/gi, '$1 * $3')
    .replace(/divide (\d+(?:\.\d+)?) by (\d+(?:\.\d+)?)/gi, '$1 / $2');

  // Word operators
  cleaned = cleaned
    .replace(/\bplus\b/g, '+')
    .replace(/\bminus\b/g, '-')
    .replace(/\btimes\b/g, '*')
    .replace(/\bmultiplied\b/g, '*')
    .replace(/\bdivided\b/g, '/')
    .replace(/\bmod\b/g, '%')
    .replace(/\bpower\b/g, '^')
    .replace(/\braised to\b/g, '^')
    .replace(/\bsquared\b/g, '^2')
    .replace(/\bcubed\b/g, '^3');

  if (!/[\d.]+.*[+\-*/%^].*[\d.]+/.test(cleaned)) {
    return null;
  }

  return cleaned;
}

/**
 * =====================================
 * SAFE EVALUATION (mathjs)
 * =====================================
 */
function safeEvaluate(expression) {
  try {
    const value = math.evaluate(expression);

    if (!isFinite(value)) {
      return {
        error: 'Cannot divide by zero.',
        value: null,
        operation: null
      };
    }

    return {
      value,
      operation: detectOperation(expression),
      error: null
    };

  } catch {
    return {
      error: 'Invalid expression.',
      value: null,
      operation: null
    };
  }
}

/**
 * =====================================
 * DETECT OPERATION TYPE
 * =====================================
 */
function detectOperation(expr) {
  if (expr.includes('+')) return 'sum';
  if (expr.includes('-')) return 'difference';
  if (expr.includes('*')) return 'product';
  if (expr.includes('/')) return 'quotient';
  if (expr.includes('%')) return 'remainder';
  if (expr.includes('^')) return 'power';
  return 'result';
}

/**
 * =====================================
 * FORMAT OUTPUT
 * =====================================
 */
function formatResult(value, operation) {
  const formatted = Number.isInteger(value)
    ? value
    : parseFloat(value.toFixed(2));

  switch (operation) {
    case 'sum':
      return `The sum is ${formatted}.`;
    case 'difference':
      return `The difference is ${formatted}.`;
    case 'product':
      return `The product is ${formatted}.`;
    case 'quotient':
      return `The quotient is ${formatted}.`;
    case 'remainder':
      return `The remainder is ${formatted}.`;
    case 'power':
      return `The result of exponentiation is ${formatted}.`;
    default:
      return `The result is ${formatted}.`;
  }
}

/**
 * =====================================
 * HEALTH CHECK
 * =====================================
 */
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

/**
 * =====================================
 * START SERVER
 * =====================================
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});