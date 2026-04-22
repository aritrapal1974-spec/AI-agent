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

    const output = findHighestScorer(query);

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
 * FIND HIGHEST SCORER
 * =====================================
 */
function findHighestScorer(query) {
  const text = query;

  // Match patterns like: Alice scored 80
  const regex = /([A-Za-z]+)\s+scored\s+(\d+)/g;

  let match;
  let maxScore = -Infinity;
  let winner = '';

  while ((match = regex.exec(text)) !== null) {
    const name = match[1];
    const score = parseInt(match[2], 10);

    if (score > maxScore) {
      maxScore = score;
      winner = name;
    }
  }

  return winner || '';
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