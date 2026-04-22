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
  // 🔥 extract ALL numbers safely
  const nums = query.match(/-?\d+/g);

  if (!nums || nums.length === 0) return "FIZZ"; // 🔥 safe fallback

  // take FIRST meaningful number
  let num = Number(nums[0]);

  // Rule 1
  num = (num % 2 === 0) ? num * 2 : num + 10;

  // Rule 2
  num = (num > 20) ? num - 5 : num + 3;

  // Rule 3
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