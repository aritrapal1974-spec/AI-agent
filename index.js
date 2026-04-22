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
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.json({ output: "0" });
    }

    const output = applyRules(query);

    return res.json({ output });

  } catch (error) {
    console.error(error);
    return res.json({ output: "0" });
  }
});

/**
 * =====================================
 * RULE ENGINE
 * =====================================
 */
function applyRules(query) {
  // 🔥 extract number safely
  const match = query.match(/-?\d+/);
  if (!match) return "0";

  let num = parseInt(match[0], 10);

  // 🔥 Rule 1
  if (num % 2 === 0) {
    num = num * 2;
  } else {
    num = num + 10;
  }

  // 🔥 Rule 2
  if (num > 20) {
    num = num - 5;
  } else {
    num = num + 3;
  }

  // 🔥 Rule 3
  if (num % 3 === 0) {
    return "FIZZ";
  }

  return String(num);
}

/**
 * =====================================
 * START SERVER
 * =====================================
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});