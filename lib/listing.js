import { SYSTEM_PROMPT } from "@/lib/constants";

export async function generateListing(ocrText, proxyUrl) {
  const resp = await fetch(`${proxyUrl}/anthropic`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate listing JSON from this OCR text:\n\n${ocrText}`,
        },
      ],
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error?.message || "Claude API error");
  }

  const data = await resp.json();
  const raw = data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
  }

  return JSON.parse(cleaned);
}
