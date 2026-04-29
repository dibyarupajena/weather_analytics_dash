import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * 🗺️ Map Component
 *
 * What it does:
 * - Creates an interactive map using Leaflet
 * - Shows satellite imagery as background
 * - Overlays weather pressure data
 * - Adds markers for Bangalore and Delhi
 *
 * Think of it like: A blank canvas (div) that we paint a map on
 */

interface City {
  name: string;
  temperature: number;
  humidity: number;
  airQuality: number;
  coordinates: [number, number];
  delayedFlights: number;
  avgDelay: number;
}

interface MapConfig {
  center: [number, number];
  zoom: number;
  flightRoutes: Array<{
    from: string;
    to: string;
    color: string;
    weight: number;
    opacity: number;
    highlighted?: boolean; // New property to highlight specific routes
  }>;
}

interface MapComponentProps {
  cities: City[]; // Changed from city1, city2 to cities array
  mapConfig: MapConfig;
}

const MapComponent = ({ cities, mapConfig }: MapComponentProps) => {
  // 📌 useRef = "Keep a reference to a DOM element"
  // This lets us access the HTML div element from JavaScript
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ⏰ useEffect = "Run this code when component first loads"
    // This is similar to the DOMContentLoaded event in vanilla JS

    if (!mapContainer.current || !cities || cities.length === 0 || !mapConfig) return; // Safety check: make sure the div exists and data is loaded

    // ⚡ Severity Calculation (same as in App.tsx)
    const getSeverity = (city: City) => {
      return (city.humidity * 0.3 + city.temperature * 0.2 + city.airQuality * 5);
    };

    // 🎨 Check if city is part of a highlighted route
    const isHighlightedRouteCity = (cityName: string): boolean => {
      return mapConfig.flightRoutes.some(route => 
        route.highlighted && (route.from === cityName || route.to === cityName)
      );
    };

    // 🎨 Color Coding Function
    const getMarkerColor = (severity: number, isHighlighted: boolean) => {
      if (isHighlighted) {
        return '#a84a4a'; // Muted dark red for highlighted route locations
      }
      // Different shades of blue based on severity
      if (severity < 50) return '#93c5fd';     // Light blue - Good weather
      if (severity < 75) return '#60a5fa';     // Medium-light blue - Moderate weather
      if (severity < 100) return '#2563eb';    // Medium-dark blue - Bad weather
      return '#1e40af';                        // Dark blue - Very bad weather
    };

    // 🗺️ Step 1: Create the map
    // L.map() = Create a new Leaflet map
    // .setView() = Set where the map is centered and how zoomed in
    // mapConfig.center = Coordinates from data.json
    // mapConfig.zoom = Zoom level from data.json
    const map = L.map(mapContainer.current).setView(mapConfig.center, mapConfig.zoom);

    // 🖼️ Step 2: Add the background satellite imagery
    // This is like putting a background photo on your canvas
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, NASA, USGS'
      }
    ).addTo(map);

    // 🌡️ Step 3: Add weather pressure overlay
    // This adds a semi-transparent layer ON TOP of the satellite map
    // opacity: 0.8 = 80% opaque (you can see through it a bit)
    L.tileLayer(
      'https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=ccb24a8ec6d36f6bde05b1d474aaebed',
      {
        opacity: 0.8,
        attribution: '&copy; OpenWeatherMap'
      }
    ).addTo(map);

    // 📍 Step 4: Add markers for all cities with color coding
    cities.forEach((city) => {
      const severity = getSeverity(city);
      const isHighlighted = isHighlightedRouteCity(city.name);
      const color = getMarkerColor(severity, isHighlighted);

      // Create custom marker icon using the place name in a muted, semi-transparent bubble
      let bubbleColor: string;
      if (isHighlighted) {
        bubbleColor = 'rgba(168, 74, 74, 0.75)'; // Muted dark red for highlighted routes
      } else if (severity < 50) {
        bubbleColor = 'rgba(147, 197, 253, 0.75)'; // Light blue - Good
      } else if (severity < 75) {
        bubbleColor = 'rgba(96, 165, 250, 0.75)'; // Medium-light blue - Moderate
      } else if (severity < 100) {
        bubbleColor = 'rgba(37, 99, 235, 0.75)'; // Medium-dark blue - Bad
      } else {
        bubbleColor = 'rgba(30, 64, 175, 0.75)'; // Dark blue - Very bad
      }

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: ${bubbleColor};
          padding: 6px 12px;
          border-radius: 999px;
          color: white;
          font-weight: 700;
          font-size: 12px;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          border: none;
        ">${city.name}</div>`,
        iconSize: [130, 32],
        iconAnchor: [65, 16]
      });

      const marker = L.marker(city.coordinates, { icon: customIcon }).addTo(map);

      // Tooltip shows more details on hover instead of click
      const severityText = severity < 50 ? 'Good' : severity < 75 ? 'Moderate' : 'Severe';
      const tooltipHtml = `
        <div style="text-align:left; min-width: 220px; padding: 8px;">
          <div style="font-weight: 700; margin-bottom: 6px; color: ${color};">${city.name}</div>
          <div style="font-size: 12px; line-height: 1.4; color: #111;">
            <div>🌡️ Temp: ${city.temperature}°C</div>
            <div>💧 Humidity: ${city.humidity}%</div>
            <div>🌬️ Air Quality: ${city.airQuality}/10</div>
            <div>✈️ Delayed Flights: ${city.delayedFlights}</div>
            <div>⏰ Avg Delay: ${city.avgDelay} min</div>
            <div style="margin-top: 4px; font-weight: 600;">Severity: ${severity.toFixed(1)} (${severityText})</div>
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipHtml, {
        direction: 'top',
        offset: [0, -20],
        permanent: false,
        sticky: true,
        opacity: 0.95,
        className: 'city-tooltip'
      });
    });

    // ✈️ Step 5: Add flight routes between cities
    mapConfig.flightRoutes.forEach((route) => {
      const fromCity = cities.find(c => c.name === route.from);
      const toCity = cities.find(c => c.name === route.to);

      if (fromCity && toCity) {
        // Create flight path with different styling for highlighted routes
        const flightPath = L.polyline([fromCity.coordinates, toCity.coordinates], {
          color: route.color,
          weight: route.highlighted ? route.weight + 2 : route.weight, // Thicker line for highlighted routes
          opacity: route.opacity,
          dashArray: route.highlighted ? undefined : '10, 10', // Solid line for highlighted, dashed for others
        }).addTo(map);

        // Add flight path popup with different styling for highlighted routes
        const routeType = route.highlighted ? '⭐ Highlighted Route' : 'Flight Route';
        flightPath.bindPopup(`
          <div style="text-align: center;">
            <h4>✈️ ${routeType}</h4>
            <p><strong>${route.from} → ${route.to}</strong></p>
            <p style="font-size: 12px; color: #666;">Click markers for weather details</p>
          </div>
        `);
      }
    });

    // 🧹 Cleanup function (runs when component is removed)
    // Remove the map from memory to prevent memory leaks
    return () => {
      map.remove();
    };
  }, [cities, mapConfig]); // Re-run when any data changes

  // 🎨 Return the HTML
  // This creates the container where the map will be displayed
  return (
    <>
      <style>
        {`
          .custom-marker {
            background: transparent !important;
            border: none !important;
          }
        `}
      </style>
      <div
        ref={mapContainer}
        style={{
          height: '500px',  // 500 pixels tall
          width: '100%',    // Full width of parent
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' // Nice shadow effect
        }}
      />
    </>
  );
};

export default MapComponent;
