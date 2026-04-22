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

    const output = extractDate(query);

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
 * DATE EXTRACTION LOGIC
 * =====================================
 */
function extractDate(query) {
  const text = query;

  // 1. 12 March 2024 / 5 Jan 2023
  const pattern1 = /\b(\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})\b/i;

  // 2. March 12, 2024
  const pattern2 = /\b((January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s*\d{4})\b/i;

  // 3. 2024-03-12
  const pattern3 = /\b(\d{4}-\d{2}-\d{2})\b/;

  // 4. 12/03/2024 or 12-03-2024
  const pattern4 = /\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})\b/;

  const patterns = [pattern1, pattern2, pattern3, pattern4];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return 'No valid date found.';
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