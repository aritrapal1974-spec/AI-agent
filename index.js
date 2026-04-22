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
  const logMatch = query.match(/log\s*:\s*(.*)/i);
  if (!logMatch) return "";

  const log = logMatch[1];

  const regex = /([A-Za-z]+)\s+paid\s+\$(\d+)/g;

  let match;

  while ((match = regex.exec(log)) !== null) {
    const name = match[1];
    const amount = Number(match[2]);

    if (name[0].toLowerCase() === 's' && amount > 100) {
      return `${name} paid the amount of $${amount}.`.trim();
    }
  }

  return "";
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});