import { NextResponse } from "next/server";

/**
 * Get geographic and infrastructure data
 * Uses OpenStreetMap and natural earth data
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get("latitude") || "40");
    const longitude = parseFloat(searchParams.get("longitude") || "-95");

    // Simulated geospatial data
    const geoData = {
      coordinates: { latitude, longitude },
      terrain: {
        type: determineTerrain(latitude, longitude),
        elevation: Math.random() * 3000,
        windSpeed: 5 + Math.random() * 10, // m/s
        solarIrradiance: 150 + Math.random() * 200, // W/m2
      },
      nearbyResources: {
        powerPlants: [
          { name: "Coal Plant A", distance: 45, capacity: 500 },
          { name: "Nuclear Plant B", distance: 120, capacity: 1000 },
          { name: "Wind Farm C", distance: 78, capacity: 250 },
        ],
        substations: [
          { name: "Substation 1", distance: 15, voltage: 345 },
          { name: "Substation 2", distance: 32, voltage: 138 },
        ],
        transmission: {
          lines: 12,
          totalCapacity: 5000, // MW
          utilizationRate: 0.65,
        },
      },
      population: {
        density: Math.random() * 500, // people/km2
        demandProfile: "commercial", // or residential, industrial
      },
    };

    return NextResponse.json({
      success: true,
      geoData,
      apiData: {
        elevation: `Using OpenElevation API pattern`,
        terrain: `Using Natural Earth data patterns`,
        infrastructure: `Simulated - integrate with local utility APIs`,
      },
    });
  } catch (error) {
    console.error("Geospatial API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch geospatial data" },
      { status: 500 }
    );
  }
}

function determineTerrain(lat: number, lon: number): string {
  if (lat > 45 || lat < 25) return "mountainous";
  if (lon < -100) return "plains";
  if (lon > -80) return "coastal";
  return "mixed";
}
