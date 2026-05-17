type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function firstNonEmptyEnv(keys: string[]): string | undefined {
  for (const k of keys) {
    const v = process.env[k]?.trim();
    if (v) return v;
  }
  return undefined;
}

/**
 * Non-streaming chat completion (OpenAI-compatible `/v1/chat/completions`).
 * API key: PAI_API_KEY, then AI_API_KEY, then OPENAI_API_KEY.
 * Base URL: PAI_BASE_URL, AI_BASE_URL, or OPENAI_API_BASE_URL (default api.openai.com).
 */
export async function deskAiComplete(messages: ChatMessage[]): Promise<{ text: string } | { error: string }> {
  const apiKey = firstNonEmptyEnv(["PAI_API_KEY", "AI_API_KEY", "OPENAI_API_KEY"]);
  if (!apiKey) return { error: "no_ai_key" };
  const baseRaw =
    firstNonEmptyEnv(["PAI_BASE_URL", "AI_BASE_URL", "OPENAI_API_BASE_URL"]) ?? "https://api.openai.com/v1";
  const baseUrl = baseRaw.replace(/\/$/, "");
  const model = firstNonEmptyEnv(["PAI_MODEL", "AI_MODEL"]) ?? "gpt-4o-mini";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.45,
      max_tokens: 1400,
    }),
  });

  const raw = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };

  if (!res.ok) {
    return { error: raw.error?.message ?? `http_${res.status}` };
  }
  const text = raw.choices?.[0]?.message?.content?.trim();
  if (!text) return { error: "empty_completion" };
  return { text };
}
