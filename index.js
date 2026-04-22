const express = require('express');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.post('/agent', (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.json({ output: "" });
    }

    const output = extractFirstValidTransaction(query);

    return res.json({ output });

  } catch (err) {
    console.error(err);
    return res.json({ output: "" });
  }
});

function extractFirstValidTransaction(query) {
  // 🔥 Extract log part
  const logMatch = query.match(/log\s*:\s*(.*)/i);
  if (!logMatch) return "";

  const log = logMatch[1];

  // 🔥 Split safely on multiple separators
  const entries = log.split(/\s*\|\s*|\s*-\s*|\s*,\s*/);

  for (let entry of entries) {
    entry = entry.trim();

    // 🔥 Match "Name paid $Amount"
    const match = entry.match(/^([A-Za-z]+)\s+paid\s+\$(\d+)/i);
    if (!match) continue;

    const name = match[1];
    const amount = Number(match[2]);

    // 🔥 Conditions
    if (name[0].toLowerCase() === 's' && amount > 100) {
      return `${name} paid the amount of $${amount}.`;
    }
  }

  return "";
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});