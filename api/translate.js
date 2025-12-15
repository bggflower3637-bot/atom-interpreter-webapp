01 export default async function handler(req, res) {
02   if (req.method !== "POST") {
03     res.status(405).json({ error: "Method not allowed" });
04     return;
05   }
06 
07   const { text, sourceLang, targetLang } = req.body || {};
08 
09   if (!text || String(text).trim() === "") {
10     res.status(400).json({ error: "No text provided" });
11     return;
12   }
13 
14   const apiKey = process.env.OPENAI_API_KEY;
15   if (!apiKey) {
16     res.status(500).json({ error: "Missing OPENAI_API_KEY in environment" });
17     return;
18   }
19 
20   try {
21     const prompt = `You are a translation engine. Translate from ${sourceLang || "Auto detect"} to ${targetLang || "English"}. Return only the translated text.`;
22 
23     const response = await fetch("https://api.openai.com/v1/chat/completions", {
24       method: "POST",
25       headers: {
26         "Content-Type": "application/json",
27         "Authorization": `Bearer ${apiKey}`
28       },
29       body: JSON.stringify({
30         model: "gpt-4.1-mini",
31         messages: [
32           { role: "system", content: prompt },
33           { role: "user", content: text }
34         ],
35         temperature: 0.2
36       })
37     });
38 
39     if (!response.ok) {
40       const errText = await response.text();
41       console.error("OpenAI API error:", response.status, errText);
42       res.status(500).json({ error: "OpenAI API error" });
43       return;
44     }
45 
46     const data = await response.json();
47     const output = (data?.choices?.[0]?.message?.content || "").trim();
48 
49     res.status(200).json({ output });
50   } catch (err) {
51     console.error("TRANSLATE API ERROR:", err);
52     res.status(500).json({ error: "Translation failed" });
53   }
54 }
