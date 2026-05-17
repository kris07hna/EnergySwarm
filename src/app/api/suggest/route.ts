import { NextResponse } from "next/server";

/**
 * Get AI suggestions using Gemini API
 * Provide optimization context for intelligent recommendations
 */
export async function POST(request: Request) {
  try {
    const { result, context } = await request.json();

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 400 }
      );
    }

    const prompt = `
Given these SwarmGrid AI optimization results:
- Solar Capacity: ${result.solarCapacity} MW
- Wind Capacity: ${result.windCapacity} MW
- Total Cost: $${result.cost}M
- Sustainability Score: ${result.sustainability}%
- Energy Output: ${result.energyOutput} MWh/year
- Disaster Resilience: ${result.disasterResilience}/100
- Maintenance Feasibility: $${result.maintenanceFeasibility}M

Context: ${context}

Provide 3 strategic recommendations for grid improvement, focusing on:
1. Operational efficiency
2. Cost optimization
3. Long-term scalability
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
      }),
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0]) {
      const suggestion = data.candidates[0].content.parts[0].text;
      return NextResponse.json({
        success: true,
        suggestion,
      });
    }

    return NextResponse.json(
      { error: "No response from Gemini API" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI suggestions" },
      { status: 500 }
    );
  }
}
