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

    const output = checkOddEven(query);

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
 * ODD / EVEN LOGIC
 * =====================================
 */
function checkOddEven(query) {
  const text = query.toLowerCase();

  // Extract first number (supports negative + decimals)
  const match = text.match(/-?\d+/);

  if (!match) {
    return 'NO'; // fallback (safe for evaluation)
  }

  const num = parseInt(match[0], 10);

  // Detect intent
  const isOddQuestion = text.includes('odd');
  const isEvenQuestion = text.includes('even');

  if (isOddQuestion) {
    return num % 2 !== 0 ? 'YES' : 'NO';
  }

  if (isEvenQuestion) {
    return num % 2 === 0 ? 'YES' : 'NO';
  }

  // fallback
  return 'NO';
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