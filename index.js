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

  // get all numbers
  const nums = text.match(/\d+/g);
  if (!nums) return null;

  // convert to numbers
  const numbers = nums.map(Number);

  // 🔥 remove common rule numbers
  const filtered = numbers.filter(n => ![1, 2, 3, 5, 10, 20].includes(n));

  if (filtered.length > 0) {
    return filtered[0]; // first valid non-rule number
  }

  // fallback → first number
  return numbers[0];
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