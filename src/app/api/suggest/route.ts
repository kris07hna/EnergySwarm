import { NextResponse } from "next/server";

type GeminiInsightAction = {
  title: string;
  detail: string;
  impact: number;
};

type GeminiInsightMetric = {
  label: string;
  value: string;
  note: string;
};

type GeminiInsight = {
  summary: string;
  verdict: string;
  confidence: number;
  strengths: string[];
  risks: string[];
  actions: GeminiInsightAction[];
  metrics: GeminiInsightMetric[];
};

function fallbackInsight(result: any): GeminiInsight {
  const sustainability = Number(result?.sustainability ?? 0);
  const resilience = Number(result?.disasterResilience ?? 0);
  const maintenance = Number(result?.maintenanceFeasibility ?? 0);
  const cost = Number(result?.cost ?? 0);

  return {
    summary:
      "The swarm solution is balanced across cost, resilience, and operational feasibility, with the strongest gains coming from better renewable allocation and a stable Pareto front.",
    verdict: sustainability >= 70 ? "Strong configuration" : "Promising but needs tuning",
    confidence: Math.max(55, Math.min(95, Math.round((sustainability + resilience + maintenance) / 3))),
    strengths: [
      "Multi-objective trade-off keeps the solution resilient under changing grid conditions.",
      "PSO output is already aligned with cost control and maintainability constraints.",
      "The Pareto archive gives planners room to choose a safer or cheaper variant.",
    ],
    risks: [
      cost > 70 ? "Capital cost remains relatively high compared with the rest of the portfolio." : "Cost exposure looks manageable, but should still be monitored.",
      resilience < 70 ? "Disaster resilience could be improved with more redundancy or topology hardening." : "Resilience is healthy, but extreme-event scenarios still need review.",
      maintenance < 70 ? "Maintenance feasibility may require better siting or service access planning." : "Maintenance is acceptable, but access constraints should stay in the review loop.",
    ],
    actions: [
      {
        title: "Rebalance renewable capacity",
        detail: "Shift the swarm toward locations with stronger resource quality to improve energy yield without broadening risk.",
        impact: 5,
      },
      {
        title: "Add storage or backup margin",
        detail: "Reserve a portion of the portfolio for storage or dispatch flexibility so peak stress events are easier to absorb.",
        impact: resilience < 70 ? 5 : 4,
      },
      {
        title: "Trim high-friction sites",
        detail: "Remove assets with weak maintenance access or poor grid coupling to reduce lifecycle friction and O&M overhead.",
        impact: maintenance < 70 ? 4 : 3,
      },
    ],
    metrics: [
      { label: "Cost", value: `$${cost.toFixed(1)}M`, note: "Capital profile" },
      { label: "Sustainability", value: `${sustainability.toFixed(1)}%`, note: "Renewable balance" },
      { label: "Resilience", value: `${resilience.toFixed(1)}/100`, note: "Hazard tolerance" },
    ],
  };
}

function parseInsight(raw: string): GeminiInsight | null {
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);

    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      verdict: typeof parsed.verdict === "string" ? parsed.verdict : "",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : Number(parsed.confidence ?? 0),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.filter((item: unknown) => typeof item === "string") : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks.filter((item: unknown) => typeof item === "string") : [],
      actions: Array.isArray(parsed.actions)
        ? parsed.actions
            .map((item: any) => ({
              title: typeof item.title === "string" ? item.title : "Action",
              detail: typeof item.detail === "string" ? item.detail : "",
              impact: Number(item.impact ?? 0),
            }))
            .filter((item: GeminiInsightAction) => item.title.length > 0)
        : [],
      metrics: Array.isArray(parsed.metrics)
        ? parsed.metrics
            .map((item: any) => ({
              label: typeof item.label === "string" ? item.label : "Metric",
              value: typeof item.value === "string" ? item.value : String(item.value ?? ""),
              note: typeof item.note === "string" ? item.note : "",
            }))
            .filter((item: GeminiInsightMetric) => item.label.length > 0)
        : [],
    };
  } catch {
    return null;
  }
}

/**
 * Get AI suggestions using Gemini API
 * Provide optimization context for intelligent recommendations
 */
export async function POST(request: Request) {
  try {
    const { result, context } = await request.json();
    const contextText = typeof context === "string" ? context : JSON.stringify(context, null, 2);

    const fallback = fallbackInsight(result);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        suggestion: fallback.summary,
        analysis: fallback,
        source: "fallback",
      });
    }

    const prompt = `
You are SwarmGrid AI's decision analyst.

Return ONLY valid JSON with the following shape:
{
  "summary": "1-2 sentence summary",
  "verdict": "Short verdict label",
  "confidence": 0-100,
  "strengths": ["point 1", "point 2", "point 3"],
  "risks": ["point 1", "point 2", "point 3"],
  "actions": [
    {"title": "Action title", "detail": "Practical detail", "impact": 1-5}
  ],
  "metrics": [
    {"label": "Metric label", "value": "Readable value", "note": "Short context"}
  ]
}

Use the following result and context:
RESULT:
${JSON.stringify(result, null, 2)}

CONTEXT:
${contextText}

Make the actions point-wise, concrete, and tied to the supplied data.
`;

    const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.map((part: any) => part?.text ?? "").join("\n") ?? "";
    const analysis = parseInsight(rawText) || fallback;

    return NextResponse.json({
      success: true,
      suggestion: analysis.summary,
      analysis,
      raw: rawText,
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({
      success: true,
      suggestion: fallbackInsight(undefined).summary,
      analysis: fallbackInsight(undefined),
      source: "fallback-error",
    });
  }
}
