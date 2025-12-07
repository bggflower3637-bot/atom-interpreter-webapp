// /api/translate.js

import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, from, to } = req.body;

  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: `Translate from ${from} to ${to}.` },
        { role: "user", content: text },
      ],
    });

    const output = completion.choices[0].message.content;

    res.status(200).json({ translated: output });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to translate" });
  }
}

  
