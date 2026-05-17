import { NextResponse } from "next/server";
import { getCached, setCached } from "@/lib/cache";

/**
 * Get solar radiation data from NASA POWER API
 * Completely free, no authentication required
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get("latitude") || "0");
    const longitude = parseFloat(searchParams.get("longitude") || "0");

    const cacheKey = `solar:${latitude}:${longitude}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, solarData: cached, coordinates: { latitude, longitude }, cached: true });
    }

    // NASA POWER API endpoint
    const apiUrl = `https://power.larc.nasa.gov/api/v1/solar/monthly/point?parameters=ALLSKY_SFC_SW_DWN,CLRSKY_SFC_SW_DWN,ALLSKY_DNI,ALLSKY_DHI&community=RE&longitude=${longitude}&latitude=${latitude}&start=2023&end=2024&format=json`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    setCached(cacheKey, data, 3600); // cache 1 hour

    return NextResponse.json({
      success: true,
      solarData: data,
      coordinates: { latitude, longitude },
      cached: false,
    });
  } catch (error) {
    console.error("Solar API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch solar data" },
      { status: 500 }
    );
  }
}
