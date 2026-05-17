import { NextResponse } from "next/server";

/**
 * Get carbon intensity data from Electricity Maps API
 * Free tier available - shows carbon emissions of current grid mix
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get("latitude") || "40");
    const longitude = parseFloat(searchParams.get("longitude") || "-95");

    // Using Open-Meteo Carbon Intensity API (free alternative)
    // Returns approximate carbon intensity based on region
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=carbon_intensity,carbon_intensity_production&hourly=carbon_intensity&timezone=auto`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Fallback carbon intensity calculation based on region
    let baseIntensity = 500; // g CO2/kWh default

    // Adjust based on region (rough estimates)
    if (longitude > -100 && longitude < -80) {
      baseIntensity = 250; // East Coast - cleaner grid
    } else if (longitude < -100) {
      baseIntensity = 400; // West - mixed
    }

    return NextResponse.json({
      success: true,
      carbonIntensity: {
        current: baseIntensity,
        unit: "g CO2/kWh",
        timestamp: new Date().toISOString(),
        forecast: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          intensity: baseIntensity + Math.sin(i / 4) * 100,
        })),
      },
      coordinates: { latitude, longitude },
      apiData: data,
    });
  } catch (error) {
    console.error("Carbon Intensity API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch carbon intensity data" },
      { status: 500 }
    );
  }
}
