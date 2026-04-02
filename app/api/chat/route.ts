import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const cleanMessage = message.trim().slice(0, 500);
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.OPENAI_API_KEY;

    const embedRes = await fetch("https://models.inference.ai.azure.com/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: [cleanMessage],
        model: "text-embedding-3-small",
      }),
    });

    const embedJson = await embedRes.json();
    const embedding = embedJson.data?.[0]?.embedding;

    if (!embedding) throw new Error("Failed to generate embedding");

    const { data: docs, error: rpcError } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_count: 5,
    });

    if (rpcError) throw rpcError;

    const filteredDocs = docs?.filter((d: any) => d.similarity > 0.6) || [];
    let context = "No relevant information found.";

    if (filteredDocs.length > 0) {
      context = filteredDocs
        .map((doc: any, i: number) => `[${i + 1}] ${doc.content}`)
        .join("\n\n");
    }

    const llmRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", 
          messages: [
            { 
              role: "system", 
              content: `You are Nico, a Full-Stack AI Engineer. Speaking to a visitor on your portfolio.
              
              CONTEXT ABOUT NICO:
              ${context}
              
              INSTRUCTIONS:
              - Speak naturally as "I".
              - If the context doesn't have the answer, politely say you don't know but mention your general expertise in AI/Full-stack.
              - Keep it concise and professional.` 
            },
            { role: "user", content: cleanMessage },
          ],
          temperature: 0.7,
          stream: true,
        }),
      }
    );

    if (!llmRes.ok) {
      const errorData = await llmRes.json();
      console.error("Groq Error:", errorData);
      throw new Error("Groq API failed");
    }

    return new Response(llmRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}