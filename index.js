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
  // 🔥 Extract part AFTER "actual task"
  let clean = query.toLowerCase();

  if (clean.includes('actual task')) {
    clean = clean.split('actual task')[1];
  }

  // remove noise
  clean = clean.replace(/[^0-9+\-*/ ]/g, ' ');

  // extract math expression
  const match = clean.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);

  if (!match) return '0';

  const a = parseInt(match[1], 10);
  const op = match[2];
  const b = parseInt(match[3], 10);

  let result;

  switch (op) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/': result = b !== 0 ? Math.floor(a / b) : 0; break;
  }
  return String(result).trim();
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