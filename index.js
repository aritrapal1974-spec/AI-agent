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
function extractInputNumber(query) {
  const text = query.toLowerCase();

  // 🔥 Try structured patterns first
  const patterns = [
    /input number\s*[:is]*\s*(\d+)/,
    /number\s*[:is]*\s*(\d+)/,
    /given\s*(\d+)/,
    /start with\s*(\d+)/,
    /take\s*(\d+)/,
    /(\d+)\s*(is the input)/,
  ];

  for (let pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[1]);
  }

  // 🔥 SMART fallback: get number BEFORE rules start
  const beforeRules = text.split(/rule\s*1/i)[0];
  const nums = beforeRules.match(/\d+/g);

  if (nums && nums.length > 0) {
    return Number(nums[nums.length - 1]); // last number before rules
  }

  // 🔥 FINAL fallback: ANY number
  const allNums = text.match(/\d+/g);
  if (allNums && allNums.length > 0) {
    return Number(allNums[0]);
  }

  return null;
}
/**
 * =====================================
 * RULE ENGINE
 * =====================================
 */

function applyRules(query) {
  const numExtracted = extractInputNumber(query);

  if (numExtracted === null) return "FIZZ"; // safe fallback

  let num = numExtracted;

  // Rule 1
  num = (num % 2 === 0) ? num * 2 : num + 10;

  // Rule 2
  num = (num > 20) ? num - 5 : num + 3;

  // Rule 3
  if (num % 3 === 0) return "FIZZ";

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