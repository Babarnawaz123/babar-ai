import Groq from "groq-sdk";

export async function POST(req) {
  try {
    const body = await req.json();
    const message = body.message;

    if (!process.env.GROQ_API_KEY) {
      return Response.json({ reply: "API key missing." });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
    });

    return Response.json({
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("ERROR:", error);
    return Response.json({
      reply: "Error generating response.",
    });
  }
}
