"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapComponent() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map centered on a major city
    mapRef.current = L.map(mapContainer.current).setView([40, -95], 4);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(mapRef.current);

    // Example markers for solar potential areas
    const solarAreas = [
      {
        name: "Arizona Solar Zone",
        lat: 33.8688,
        lng: -111.0261,
        type: "solar",
      },
      {
        name: "West Texas Wind Farm",
        lat: 31.7683,
        lng: -102.447,
        type: "wind",
      },
      {
        name: "California Valley",
        lat: 36.7783,
        lng: -119.4179,
        type: "solar",
      },
    ];

    solarAreas.forEach((area) => {
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style="background-color: ${
          area.type === "solar" ? "#fbbf24" : "#06b6d4"
        }">
          ${area.type === "solar" ? "☀" : "💨"}
        </div>`,
        iconSize: [32, 32],
      });

      L.marker([area.lat, area.lng], { icon })
        .bindPopup(`<strong>${area.name}</strong>`)
        .addTo(mapRef.current!);
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return <div ref={mapContainer} className="w-full h-full" />;
}
