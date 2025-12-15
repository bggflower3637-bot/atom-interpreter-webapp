import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false
  }
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    const audio = fs.createReadStream(files.file[0].filepath);

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "gpt-4o-transcribe"
    });

    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        {
          role: "system",
          content: "You are Atom Interpreter AI. Interpret naturally."
        },
        {
          role: "user",
          content: transcription.text
        }
      ]
    });

    res.json({
      text: response.choices[0].message.content
    });
  });
}
