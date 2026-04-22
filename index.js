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
        output: '0'
      });
    }

    const output = solveMath(query);

    return res.status(200).json({ output });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      output: '0'
    });
  }
});

/**
 * =====================================
 * INJECTION-SAFE MATH SOLVER
 * =====================================
 */
function solveMath(query) {
  // 🔥 Extract ONLY valid math expression
  const match = query.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);

  if (!match) return '0';

  const a = parseInt(match[1], 10);
  const operator = match[2];
  const b = parseInt(match[3], 10);

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

  // 🔥 CRITICAL: return ONLY number string
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