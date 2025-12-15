// /api/translate.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { text, targetLang = "English" } = req.body || {};

  if (!text || text.trim() === "") {
    res.status(400).json({ error: "No text provided" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Translate the following text to ${targetLang}. Return only the translation:\n\n${text}`,
      }),
    });

    const data = await response.json();

    const output =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "";

    res.status(200).json({ output });
  } catch (err) {
    console.error("TRANSLATE API ERROR:", err);
    res.status(500).json({ error: "Translation failed" });
  }
}
