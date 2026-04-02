import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const rawData = fs.readFileSync("./data/knowledge.json", "utf-8");
const documents = JSON.parse(rawData);

async function ingest() {
  console.log("Start ingesting via GitHub Models (with 5s delay)");

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.OPENAI_API_KEY;

  for (const doc of documents) {
    try {
      await delay(5000);

      const embedRes = await fetch("https://models.inference.ai.azure.com/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: [doc.content], 
          model: "text-embedding-3-small",
        }),
      });

      const embedData = await embedRes.json();
      
      const embedding = embedData.data?.[0]?.embedding;

      if (!embedding) {
        console.error("Failed embedding. Response:", JSON.stringify(embedData));
        continue;
      }

      const { error } = await supabase.from("documents").insert({
        content: doc.content,
        metadata: doc.metadata,
        embedding,
      });

      if (error) {
        console.error("Insert error:", error);
      } else {
        console.log("Inserted:", doc.metadata?.title || "Untitled");
      }

    } catch (err) {
      console.error("Error processing doc:", err);
    }
  }

  console.log("Ingest completed.");
}

ingest();