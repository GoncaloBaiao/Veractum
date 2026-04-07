import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Claim, FactCheckedClaim, ClaimStatusValue, SourceReference } from "@/types";

const MAX_CLAIMS_PER_BATCH = 15;
const GEMINI_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash"] as const;

interface GeminiLikeError {
  status?: number;
  statusText?: string;
  errorDetails?: unknown;
  message?: string;
}

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

interface FactCheckResult {
  status: ClaimStatusValue;
  confidence: number;
  reasoning: string;
  sources: Array<{ title: string; url: string; domain: string }>;
}

function formatGeminiError(error: unknown, fallback: string): Error {
  const err = error as GeminiLikeError;
  const messagePart = typeof err?.message === "string" && err.message.trim()
    ? err.message.trim()
    : fallback;
  const statusPart = typeof err?.status === "number"
    ? `status: ${err.status}${err.statusText ? ` ${err.statusText}` : ""}`
    : null;
  const detailsPart = err?.errorDetails !== undefined
    ? `errorDetails: ${JSON.stringify(err.errorDetails)}`
    : null;

  return new Error([messagePart, statusPart, detailsPart].filter(Boolean).join(" | ") || fallback);
}

async function generateWithModelFallback(
  client: GoogleGenerativeAI,
  prompt: string
): Promise<string> {
  let lastError: Error | null = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
          responseMimeType: "application/json",
        },
      });

      const response = await model.generateContent([prompt]);
      const content = response.response.text();

      if (!content) {
        throw new Error(`No response from Gemini model ${modelName}.`);
      }

      return content;
    } catch (error) {
      const formatted = formatGeminiError(
        error,
        `Gemini fact-check request failed for model ${modelName}.`
      );
      lastError = formatted;

      const err = error as GeminiLikeError;
      const shouldTryNextModel = err?.status === 404 || err?.status === 429;
      if (!shouldTryNextModel) {
        throw formatted;
      }
    }
  }

  throw lastError ?? new Error("Gemini fact-check request failed for all configured models.");
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
    const content = await generateWithModelFallback(
      client,
      `You are a rigorous fact-checker. Given a claim and any available web evidence, assess the claim's veracity.

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
${webEvidence || "No web evidence available."}`
    );

    const parsed = JSON.parse(content) as FactCheckResult;

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
    const detailedError = formatGeminiError(
      error,
      "Unable to verify this claim due to a processing error."
    );

    return {
      status: "insufficient",
      confidence: 30,
      reasoning: detailedError.message,
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
