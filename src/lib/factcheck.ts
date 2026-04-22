import { GoogleGenAI, Type } from "@google/genai";
import { LOCALE_LANGUAGE_MAP } from "@/lib/ai";
import type { Claim, FactCheckedClaim, ClaimStatusValue, SourceReference } from "@/types";

const GEMINI_MODEL = "gemini-2.5-flash";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
}

interface FactCheckResult {
  status: ClaimStatusValue;
  confidence: number;
  reasoning: string;
  sources: Array<{ title: string; url: string; domain: string }>;
}



/**
 * Fact-check an array of claims using OpenAI and (optionally) web search.
 * Opinions are auto-classified without web search.
 */
export async function factCheckClaims(claims: Claim[], locale: string = "en", maxClaims: number = 5): Promise<FactCheckedClaim[]> {
  const batch = claims.slice(0, maxClaims);
  const results: FactCheckedClaim[] = [];
  const CONCURRENCY = 3;

  for (let i = 0; i < batch.length; i += CONCURRENCY) {
    const chunk = batch.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(
      chunk.map(async (claim): Promise<FactCheckedClaim> => {
        if (claim.type === "opinion") {
          return {
            ...claim,
            status: "opinion",
            confidence: 0,
            reasoning:
              "This is a subjective opinion or value judgment that cannot be objectively verified.",
            sources: [],
          };
        }

        const factCheckResult = await verifyClaim(claim, locale);
        return {
          ...claim,
          status: factCheckResult.status,
          confidence: factCheckResult.confidence,
          reasoning: factCheckResult.reasoning,
          sources: factCheckResult.sources,
        };
      })
    );
    results.push(...chunkResults);
  }

  return results;
}

async function verifyClaim(claim: Claim, locale: string = "en"): Promise<FactCheckResult> {
  const client = getClient();
  const language = LOCALE_LANGUAGE_MAP[locale] || "English";

  // Web search with 8s timeout — skip gracefully if Tavily is slow
  let webEvidence: string | null = null;
  try {
    webEvidence = await Promise.race([
      searchForEvidence(claim.text),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
    ]);
  } catch {
    webEvidence = null;
  }

  try {
    const hasEvidence = webEvidence !== null && webEvidence.length > 0;

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Respond entirely in ${language}. All text fields in your response (reasoning, source titles) must be in ${language}.

You are a rigorous fact-checker. Analyze the claim below using the provided web evidence and your own knowledge.

CLAIM: "${claim.text}"
CLAIM TYPE: ${claim.type}

WEB SEARCH RESULTS:
${hasEvidence ? webEvidence : "No web search results were found for this claim."}

INSTRUCTIONS:
1. Carefully read ALL the web evidence provided above.
2. Cross-reference the claim against the evidence and your own knowledge.
3. Determine the most accurate verdict.

VERDICT RULES:
- "supported" (confidence 70-100): The evidence clearly confirms the claim. Use this when web sources directly support it.
- "contested" (confidence 30-70): Evidence contradicts or raises significant doubts about the claim.
- "insufficient" (confidence 20-50): Not enough evidence either way. ONLY use this as a last resort when no evidence exists at all.
- "opinion": The claim is purely subjective and cannot be objectively verified.

IMPORTANT:
- ${hasEvidence ? "Web evidence IS available above — analyze it carefully before deciding. Do NOT default to 'insufficient' when evidence exists." : "No web evidence was found, but you may still assess common factual claims using your training knowledge. Only use 'insufficient' if you genuinely cannot determine the answer."}
- The confidence score (0-100) must reflect how certain you are.  A higher number means more certainty.
- Extract source references from the web evidence when available.  Include the title, full URL, and domain.
- Keep the reasoning field under 300 characters. Be concise: 1-2 short sentences maximum.`,
      config: {
        temperature: 0.1,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ["supported", "contested", "opinion", "insufficient"] },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING },
                  domain: { type: Type.STRING },
                },
                required: ["title", "url", "domain"],
              },
            },
          },
          required: ["status", "confidence", "reasoning", "sources"],
        },
      },
    });

    const content = response.text;
    if (!content) {
      throw new Error("No response from Gemini.");
    }

    let parsed: FactCheckResult;
    try {
      parsed = JSON.parse(content) as FactCheckResult;
    } catch {
      return {
        status: "insufficient",
        confidence: 30,
        reasoning: "Unable to verify this claim due to a processing error.",
        sources: [],
      };
    }

    return {
      status: parsed.status,
      confidence: Math.min(100, Math.max(0, parsed.confidence)),
      reasoning: parsed.reasoning,
      sources: (parsed.sources || [])
        .filter((s: SourceReference) =>
          s.url &&
          s.url.startsWith("http") &&
          !s.url.includes("veractum")
        )
        .map((s: SourceReference) => ({
          title: s.title,
          url: s.url,
          domain: s.domain,
        })),
    };
  } catch (error) {
    const raw = error instanceof Error ? error.message : "";
    const message =
      raw.length > 200 || raw.includes("<") || raw.startsWith("{")
        ? "Unable to verify this claim due to a processing error."
        : raw || "Unable to verify this claim due to a processing error.";

    return {
      status: "insufficient",
      confidence: 30,
      reasoning: message,
      sources: [],
    };
  }
}

/**
 * Search for evidence using the Tavily API.
 * Returns a formatted string of search results for the LLM to process.
 */
async function searchForEvidence(claimText: string): Promise<string | null> {
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (!tavilyKey) {
    return null;
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: `fact check: ${claimText}`,
        search_depth: "basic",
        max_results: 3,
        include_answer: true,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    const results: Array<{ title: string; url: string; content: string }> =
      data.results ?? [];

    if (results.length === 0) {
      return data.answer ? `AI-synthesized answer: ${data.answer}` : null;
    }

    const formatted = results
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.content.slice(0, 200)}`)
      .join("\n\n");

    return data.answer
      ? `AI-synthesized answer: ${data.answer}\n\nSources:\n${formatted}`
      : formatted;
  } catch {
    return null;
  }
}
