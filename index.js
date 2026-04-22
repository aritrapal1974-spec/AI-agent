const express = require('express');

const app = express();
const PORT = process.env.PORT || 8000;

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
        output: 'Error: "query" must be a non-empty string.'
      });
    }

    const output = solveMath(query);

    return res.status(200).json({ output });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      output: 'Internal server error.'
    });
  }
});

/**
 * =====================================
 * SAFE MATH SOLVER (IGNORES INJECTION)
 * =====================================
 */
function solveMath(query) {
  const text = query.toLowerCase();

  // 🔥 Extract ONLY valid math expression (ignore everything else)
  const match = text.match(/(\d+\s*[\+\-\*\/]\s*\d+)/);

  if (!match) return '0';

  const expression = match[1];

  // Parse numbers and operator safely
  const parts = expression.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);

  if (!parts) return '0';

  const a = parseInt(parts[1], 10);
  const operator = parts[2];
  const b = parseInt(parts[3], 10);

  let result = 0;

  switch (operator) {
    case '+':
      result = a + b;
      break;
    case '-':
      result = a - b;
      break;
    case '*':
      result = a * b;
      break;
    case '/':
      result = b !== 0 ? Math.floor(a / b) : 0;
      break;
  }

  return String(result);
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