// api/translate.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { text, to = "English" } = req.body || {};

    if (!text || !String(text).trim()) {
      res.status(200).json({ output: "" });
      return;
    }

    // OpenAI Responses API (recommended)
    const response = await client.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "system",
          content:
            "You are Atom Interpreter AI. Interpret the user's speech naturally into the target language. Return only the translated text.",
        },
        {
          role: "user",
          content: `Target language: ${to}\n\n${text}`,
        },
      ],
    });

    res.status(200).json({
      output: response.output_text ?? "",
    });
  } catch (err) {
    console.error("translate API error:", err);
    res.status(500).json({ error: "OpenAI request failed" });
  }
}
