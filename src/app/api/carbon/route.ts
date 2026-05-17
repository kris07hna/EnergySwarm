import { NextResponse } from "next/server";

const REGION_BASED_INTENSITY: Record<string, number> = {
  "40.7": 280, "34.0": 350, "41.8": 150, "51.0": 120,
  "37.7": 320, "29.7": 450, "47.6": 180, "44.9": 200,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("latitude") || "40";
    const lon = searchParams.get("longitude") || "-95";
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    let baseIntensity = 350;

    const regionKey = Object.keys(REGION_BASED_INTENSITY).find(k =>
      Math.abs(parseFloat(k) - latitude) < 3
    );
    if (regionKey) baseIntensity = REGION_BASED_INTENSITY[regionKey];
    if (longitude < -100) baseIntensity += 80;
    if (longitude > -80) baseIntensity -= 30;

    const hour = new Date().getHours();
    const solarFactor = (hour >= 7 && hour <= 18) ? 0.7 : 1.0;
    baseIntensity = Math.round(baseIntensity * solarFactor);

    return NextResponse.json({
      success: true,
      carbonIntensity: {
        current: baseIntensity,
        unit: "g CO2/kWh",
        timestamp: new Date().toISOString(),
        forecast: Array.from({ length: 24 }, (_, h) => ({
          hour: h,
          intensity: Math.round(baseIntensity * (h >= 7 && h <= 18 ? 0.7 : 1.0) + Math.sin(h / 4) * 50),
        })),
      },
      coordinates: { latitude, longitude },
    });
  } catch (error) {
    console.error("Carbon Intensity API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch carbon intensity data" },
      { status: 500 }
    );
  }
}
