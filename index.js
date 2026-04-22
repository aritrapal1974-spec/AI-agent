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

    if (!query || typeof query !== 'string') {
      return res.json({ output: '0' });
    }

    const output = solveMath(query);

    return res.json({ output });

  } catch (error) {
    console.error(error);
    return res.json({ output: '0' });
  }
});

/**
 * =====================================
 * FINAL ROBUST SOLVER
 * =====================================
 */
function solveMath(query) {
  let text = query.toLowerCase();

  // 🔥 STEP 1: focus on actual task (ignore injection)
  if (text.includes('actual task')) {
    text = text.split('actual task')[1];
  }

  // 🔥 STEP 2: clean everything except math
  text = text.replace(/[^0-9+\-*/ ]/g, ' ');

  // 🔥 STEP 3: extract expression
  const match = text.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);

  if (!match) return '0';

  const a = Number(match[1]);
  const op = match[2];
  const b = Number(match[3]);

  let result = 0;

  switch (op) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/': result = b !== 0 ? Math.floor(a / b) : 0; break;
  }

  // 🔥 CRITICAL: exact format
  return String(result).trim();
}

/**
 * =====================================
 * HEALTH CHECK
 * =====================================
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * =====================================
 * START SERVER
 * =====================================
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});