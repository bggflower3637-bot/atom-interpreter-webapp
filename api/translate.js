// /api/translate.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { text, sourceLang, targetLang } = req.body || {};

  if (!text || text.trim() === "") {
    res.status(400).json({ error: "No text provided" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Missing OPENAI_API_KEY in environment");
    res.status(500).json({ error: "Server config error" });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are a translation engine. Translate from ${sourceLang || "Korean"} to ${
              targetLang || "English"
            }. Return only the translated sentence.`,
          },
          { role: "user", content: text },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error:", response.status, errText);
      res.status(500).json({ error: "OpenAI API error" });
      return;
    }

    const data = await response.json();
    const translatedText =
      (data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content) ||
      "";

    res.status(200).json({ translatedText: translatedText.trim() });
  } catch (error) {
    console.error("Translate handler error:", error);
    res.status(500).json({ error: "Failed to translate" });
  }
}
