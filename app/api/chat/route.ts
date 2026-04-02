import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;
    const GITHUB_TOKEN =
      process.env.GITHUB_TOKEN || process.env.OPENAI_API_KEY;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error("Missing Supabase ENV");
    }

    if (!GITHUB_TOKEN) {
      throw new Error("Missing Embedding API Token");
    }

    if (!GROQ_API_KEY) {
      throw new Error("Missing GROQ API Key");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message" },
        { status: 400 }
      );
    }

    const cleanMessage = message.trim().slice(0, 500);

    const embedRes = await fetch(
      "https://models.inference.ai.azure.com/embeddings",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: [cleanMessage],
          model: "text-embedding-3-small",
        }),
      }
    );

    const embedJson = await embedRes.json();

    if (!embedRes.ok) {
      console.error("Embedding API Error:", embedJson);
      throw new Error("Embedding API failed");
    }

    const embedding = embedJson.data?.[0]?.embedding;

    if (!embedding) {
      console.error("Embedding Missing:", embedJson);
      throw new Error("Failed to generate embedding");
    }

    const { data: docs, error: rpcError } = await supabase.rpc(
      "match_documents",
      {
        query_embedding: embedding,
        match_count: 5,
      }
    );

    if (rpcError) {
      console.error("Supabase RPC Error:", rpcError);
      throw rpcError;
    }

    const filteredDocs =
      docs?.filter((d: any) => d.similarity > 0.6) || [];

    let context = "No relevant information found.";

    if (filteredDocs.length > 0) {
      context = filteredDocs
        .map(
          (doc: any, i: number) =>
            `[${i + 1}] (${doc.metadata?.title || "info"})\n${doc.content}`
        )
        .join("\n\n");
    }

    const systemPrompt = `
You are Nico, an AI Engineer specializing in NLP and RAG systems.

You are talking to a recruiter visiting your portfolio.

STYLE:
- Friendly, confident, and natural
- Keep answers concise but insightful

RULES:
- Speak as "I"
- Use provided context when relevant
- If unsure, say you don't know (do not hallucinate)

CONTEXT ABOUT NICO:
${context}
`;

    const llmRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
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

    return NextResponse.json(
      {
        error: "Internal Server Error",
        detail: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}