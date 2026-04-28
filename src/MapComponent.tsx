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

    // 🎨 Color Coding Function
    const getMarkerColor = (severity: number) => {
      if (severity < 50) return 'green';      // Good weather
      if (severity < 80) return 'orange';    // Moderate weather
      return 'red';                          // Bad weather
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
      const color = getMarkerColor(severity);

      // Create custom marker icon based on severity
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">${Math.round(severity)}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker(city.coordinates, { icon: customIcon }).addTo(map);

      // Enhanced popup with severity information
      const severityText = severity < 50 ? 'Good' : severity < 80 ? 'Moderate' : 'Severe';
      marker.bindPopup(`
        <div style="text-align: center; min-width: 200px;">
          <h3 style="margin: 0 0 10px 0; color: ${color};">🏙️ ${city.name}</h3>
          <div style="background: ${color}20; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
            <strong>Weather Severity: ${severity.toFixed(1)} (${severityText})</strong>
          </div>
          <p style="margin: 4px 0;">🌡️ Temperature: ${city.temperature}°C</p>
          <p style="margin: 4px 0;">💧 Humidity: ${city.humidity}%</p>
          <p style="margin: 4px 0;">🌬️ Air Quality: ${city.airQuality}/10</p>
          <p style="margin: 4px 0;">✈️ Delayed Flights: ${city.delayedFlights}</p>
          <p style="margin: 4px 0;">⏰ Avg Delay: ${city.avgDelay} min</p>
        </div>
      `);

      // Open Bangalore popup by default
      if (city.name === 'Bangalore') {
        marker.openPopup();
      }
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
