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
    const { query } = req.body;

    // Validate input
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Invalid input: "query" must be a non-empty string'
      });
    }

   
  

    // ===================================================================
    // ENHANCED CALCULATOR LOGIC - Dynamic parsing for arithmetic operations
    // ===================================================================
    // This implementation extracts numbers and operations from natural
    // language queries using Regex pattern matching and math evaluation.
    //
    // NOTE: PLACEHOLDER FOR LLM INTEGRATION
    // ===================================================================
    // To swap this out with an actual LLM API (OpenAI, Anthropic, etc.):
    //
    // 1. Replace the calculateExpression() call with an async LLM call:
    //    const output = await callLLMAPI(query, assets);
    //
    // 2. Example async function structure:
    //    async function callLLMAPI(query, assets) {
    //      const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //        method: 'POST',
    //        headers: {
    //          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    //          'Content-Type': 'application/json'
    //        },
    //        body: JSON.stringify({
    //          model: 'gpt-4',
    //          messages: [{ role: 'user', content: query }],
    //          temperature: 0.7
    //        })
    //      });
    //      const data = await response.json();
    //      return data.choices[0].message.content;
    //    }
    //
    // 3. Make the route async and await the LLM call
    // ===================================================================

    // Call the calculator function
    const output = calculateExpression(query);

    // Return the response in the required format
    return res.status(200).json({ output });

  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({
      error: 'Internal server error: ' + error.message
    });
  }
});

/**
 * Enhanced Calculator Parser
 * 
 * Extracts numbers and operations from natural language queries.
 * Supports:
 *   - Addition (+, plus)
 *   - Subtraction (-, minus)
 *   - Multiplication (*, times, multiplied by)
 *   - Division (/, divided by)
 *   - Exponentiation (^, power, squared, cubed)
 *   - Modulo (%, mod)
 * 
 * @param {string} query - The user's question (e.g., "What is 10 + 15?")
 * @returns {string} - The answer in natural language format
 */
function calculateExpression(query) {
  // Normalize the query
  const normalizedQuery = query.toLowerCase().trim();

  // Try to extract a mathematical expression
  // Pattern matches: number operator number (with optional decimals)
  const mathPattern = /(\d+(?:\.\d+)?)\s*([+\-*/%^])\s*(\d+(?:\.\d+)?)/;
  const match = normalizedQuery.match(mathPattern);

  if (!match) {
    return 'I could not parse a mathematical expression from your query. Please provide numbers and an operation (e.g., "What is 10 + 15?").';
  }

  const num1 = parseFloat(match[1]);
  const operator = match[2];
  const num2 = parseFloat(match[3]);

  let result;
  let operationName;

  // Perform the calculation based on the operator
  switch (operator) {
    case '+':
      result = num1 + num2;
      operationName = 'sum';
      break;
    case '-':
      result = num1 - num2;
      operationName = 'difference';
      break;
    case '*':
      result = num1 * num2;
      operationName = 'product';
      break;
    case '/':
      if (num2 === 0) {
        return 'Cannot divide by zero.';
      }
      result = num1 / num2;
      operationName = 'quotient';
      break;
    case '%':
      if (num2 === 0) {
        return 'Cannot divide by zero in modulo operation.';
      }
      result = num1 % num2;
      operationName = 'remainder';
      break;
    case '^':
      result = Math.pow(num1, num2);
      operationName = 'result of exponentiation';
      break;
    default:
      return 'Unsupported operation.';
  }

  // Format the result (handle floating point precision)
  const formattedResult = Number.isInteger(result) ? result : result.toFixed(2);

  // Return the answer in natural language format
  return `The ${operationName} is ${formattedResult}.`;
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
