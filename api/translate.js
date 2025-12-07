// api/translate.js – Vercel Serverless Function

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY is not set." });
  }

  try {
    const { text, sourceLang, targetLang } = req.body || {};

    if (!text || !targetLang) {
      return res.status(400).json({ error: "text / targetLang is required" });
    }

    const systemPrompt = `
You are a professional real-time interpreter.
Translate the user's message from ${sourceLang || "auto"} to ${targetLang}.
Return translation only, no explanations.
    `.trim();

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error("OpenAI error:", errorText);
      return res.status(500).json({ error: "OpenAI API error" });
    }

    const json = await openaiRes.json();
    const translatedText =
      json.choices?.[0]?.message?.content?.trim() || "";

    return res.status(200).json({ translatedText });
  } catch (err) {
    console.error("translate API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
