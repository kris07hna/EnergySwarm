import { NextResponse } from "next/server";
import { getCached, setCached } from "@/lib/cache";

/**
 * Get weather data from Open-Meteo API (free, no key required)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get("latitude") || "0");
    const longitude = parseFloat(searchParams.get("longitude") || "0");

    // Cache key
    const cacheKey = `weather:${latitude}:${longitude}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, weather: cached, coordinates: { latitude, longitude }, cached: true });
    }

    // Open-Meteo API endpoint
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,cloud_cover&hourly=temperature_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Cache for 5 minutes
    setCached(cacheKey, data, 300);

    return NextResponse.json({
      success: true,
      weather: data,
      coordinates: { latitude, longitude },
      cached: false,
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
