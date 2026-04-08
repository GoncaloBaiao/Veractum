import { GoogleGenAI } from "@google/genai";
import type { Claim, FactCheckedClaim, ClaimStatusValue, SourceReference } from "@/types";

const MAX_CLAIMS_PER_BATCH = 15;
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
 * Strip markdown fences and attempt to repair truncated JSON.
 */
function cleanAndParseJson<T = unknown>(raw: string): T {
  let text = raw.trim();

  // Strip markdown code fences
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  try {
    return JSON.parse(text);
  } catch {
    // Attempt to repair truncated JSON
    const repaired = repairTruncatedJson(text);
    return JSON.parse(repaired);
  }
}

function repairTruncatedJson(text: string): string {
  const quoteCount = (text.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    text += '"';
  }

  text = text.replace(/,\s*$/, "");

  const opens = { "{": 0, "[": 0 };
  const closes: Record<string, "{" | "["> = { "}": "{", "]": "[" };
  for (const ch of text) {
    if (ch === "{" || ch === "[") opens[ch]++;
    if ((ch === "}" || ch === "]") && opens[closes[ch]] > 0) opens[closes[ch]]--;
  }

  for (let i = 0; i < opens["["]; i++) text += "]";
  for (let i = 0; i < opens["{"]; i++) text += "}";

  return text;
}

/**
 * Fact-check an array of claims using OpenAI and (optionally) web search.
 * Opinions are auto-classified without web search.
 */
export async function factCheckClaims(claims: Claim[]): Promise<FactCheckedClaim[]> {
  const batch = claims.slice(0, MAX_CLAIMS_PER_BATCH);
  const results: FactCheckedClaim[] = [];

  for (const claim of batch) {
    if (claim.type === "opinion") {
      results.push({
        ...claim,
        status: "opinion",
        confidence: 0,
        reasoning:
          "This is a subjective opinion or value judgment that cannot be objectively verified.",
        sources: [],
      });
      continue;
    }

    const factCheckResult = await verifyClaim(claim);
    results.push({
      ...claim,
      status: factCheckResult.status,
      confidence: factCheckResult.confidence,
      reasoning: factCheckResult.reasoning,
      sources: factCheckResult.sources,
    });
  }

  return results;
}

async function verifyClaim(claim: Claim): Promise<FactCheckResult> {
  const client = getClient();

  // Attempt web search via Tavily for supporting evidence
  const webEvidence = await searchForEvidence(claim.text);

  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: `You are a rigorous fact-checker. Given a claim and any available web evidence, assess the claim's veracity.

Return JSON with this exact structure:
{
  "status": "supported" | "contested" | "opinion" | "insufficient",
  "confidence": 0-100,
  "reasoning": "Brief explanation of your assessment",
  "sources": [
    {
      "title": "Source page title",
      "url": "https://...",
      "domain": "example.com"
    }
  ]
}

Status definitions:
- "supported": Strong evidence confirms the claim (confidence 70-100)
- "contested": Evidence contradicts or significantly questions the claim (confidence 30-70)
- "opinion": The claim is subjective and cannot be verified
- "insufficient": Not enough evidence to make a determination (confidence 20-50)

Rules:
- Be conservative — only mark "supported" with strong evidence
- Provide 1-3 source references when possible
- If web evidence is available, weigh it heavily
- confidence should reflect certainty of your assessment
- reasoning should be 1-3 sentences max

Claim: "${claim.text}"

Claim type: ${claim.type}

Web evidence:
${webEvidence || "No web evidence available."}`,
      config: {
        temperature: 0.1,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    });

    const content = response.text;
    if (!content) {
      throw new Error("No response from Gemini.");
    }

    const parsed = cleanAndParseJson<FactCheckResult>(content);

    return {
      status: parsed.status,
      confidence: Math.min(100, Math.max(0, parsed.confidence)),
      reasoning: parsed.reasoning,
      sources: (parsed.sources || []).map((s: SourceReference) => ({
        title: s.title,
        url: s.url,
        domain: s.domain,
      })),
    };
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Unable to verify this claim due to a processing error.";

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
        query: `Is this true: ${claimText}`,
        search_depth: "basic",
        max_results: 5,
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
