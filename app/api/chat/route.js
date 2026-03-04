import Groq from "groq-sdk";

export async function POST(req) {
  try {
    const body = await req.json();
    
    // 1. Support for full message history (matches your new page.js)
    const { messages } = body; 

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ reply: "Invalid message format." }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return Response.json({ reply: "Server error: API key missing." }, { status: 500 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // 2. Optimized API Call
    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are BabarGPT, a helpful assistant. Use markdown for clear formatting. Keep responses helpful but concise to stay within limits." 
        },
        ...messages 
      ],
      // TIP: "llama-3.1-8b-instant" is MUCH harder to get restricted on than "70b" 
      // because it has significantly higher Rate Limits (RPD/TPM) for free users.
      model: "llama-3.1-8b-instant", 
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
    });

    return Response.json({
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("GROQ_ERROR:", error);

    // 3. Specific Error Handling to prevent account flags
    if (error.status === 429) {
      return Response.json({ 
        reply: "⚠️ I'm breathing a bit hard! (Rate limit reached). Please wait 30 seconds and try again." 
      }, { status: 429 });
    }

    if (error.status === 401) {
      return Response.json({ 
        reply: "⚠️ API Key error. Please check your Vercel environment variables." 
      }, { status: 401 });
    }

    return Response.json({ 
      reply: "I hit a snag. Let's try that again in a moment." 
    }, { status: 500 });
  }
}