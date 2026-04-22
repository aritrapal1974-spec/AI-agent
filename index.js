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

    const output = sumEvenNumbers(query);

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
 * SUM EVEN NUMBERS LOGIC
 * =====================================
 */
function sumEvenNumbers(query) {
  const text = query.toLowerCase();

  // Extract all numbers (supports negatives too)
  const matches = text.match(/-?\d+/g);

  if (!matches) return '0';

  const numbers = matches.map(num => parseInt(num, 10));

  // Filter even numbers
  const evenNumbers = numbers.filter(n => n % 2 === 0);

  // Sum them
  const sum = evenNumbers.reduce((acc, val) => acc + val, 0);

  return String(sum);
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