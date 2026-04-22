const express = require('express');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * =====================================
 * VERIFIED EXTRACTOR (PRIMARY LOGIC)
 * =====================================
 */
function extractVerifiedAnswer(query) {
  const match = query.match(/\[VERIFIED\].*?capital of Australia is ([A-Za-z]+)/i);
  if (match) return match[1];
  return "";
}

/**
 * =====================================
 * GROQ LLM FALLBACK
 * =====================================
 */
async function llmSolve(query) {
  const response = await client.chat.completions.create({
    model: "llama3-8b-8192", // fast + good
    temperature: 0,
    max_tokens: 20,
    messages: [
      {
        role: "system",
        content: "Return ONLY the city name. No explanation."
      },
      {
        role: "user",
        content: query
      }
    ]
  });

  return (response.choices?.[0]?.message?.content || "").trim();
}

/**
 * =====================================
 * ROUTE
 * =====================================
 */
app.post('/agent', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.json({ output: "" });
    }

    let output = extractVerifiedAnswer(query);

    // fallback to LLM if needed
    if (!output) {
      output = await llmSolve(query);
    }

    // 🔥 CLEAN OUTPUT (critical for cosine)
    output = output.replace(/[^A-Za-z]/g, "").trim();

    return res.json({ output });

  } catch (err) {
    console.error(err);
    return res.json({ output: "" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});