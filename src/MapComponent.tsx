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
  selectedFrom: string;
  selectedTo: string;
}

const MapComponent = ({ cities, mapConfig, selectedFrom, selectedTo }: MapComponentProps) => {
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

    // 🎨 Check if city is part of the selected route or any highlighted route
    const isHighlightedRouteCity = (cityName: string): boolean => {
      if (cityName === selectedFrom || cityName === selectedTo) return true;

      return mapConfig.flightRoutes.some(route =>
        route.highlighted && (route.from === cityName || route.to === cityName)
      );
    };

    // 🎨 Color Coding Function
    const getMarkerColor = (severity: number, isHighlighted: boolean) => {
      if (isHighlighted) {
        return '#f87171'; // Lighter red for highlighted route
      }
      // Lighter, muted green, yellow, red based on delay severity
      if (severity < 50) return '#86efac';     // Light muted green - Low delay
      if (severity < 75) return '#fef08a';     // Light muted yellow - Medium delay
      return '#fca5a5';                        // Light muted red - High delay
    };

    // 🗺️ Step 1: Create the map focused on India
    // L.map() = Create a new Leaflet map
    // .setView() = Set where the map is centered and how zoomed in
    // mapConfig.center = Coordinates from data.json
    // mapConfig.zoom = Zoom level from data.json
    const indiaBounds = L.latLngBounds(
      [6.5546079, 68.1113787], // southwest corner
      [35.6745457, 97.395561]  // northeast corner
    );

    const map = L.map(mapContainer.current, {
      maxBounds: indiaBounds,
      maxBoundsViscosity: 0.75,
      minZoom: 4,
      maxZoom: 7,
      zoomControl: true,
      attributionControl: true,
      worldCopyJump: false
    }).setView(mapConfig.center, mapConfig.zoom);

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
        bubbleColor = 'rgba(248, 113, 113, 0.65)'; // Lighter red for highlighted routes
      } else if (severity < 50) {
        bubbleColor = 'rgba(134, 239, 172, 0.65)'; // Light muted green - Low delay
      } else if (severity < 75) {
        bubbleColor = 'rgba(254, 240, 138, 0.65)'; // Light muted yellow - Medium delay
      } else {
        bubbleColor = 'rgba(252, 165, 165, 0.65)'; // Light muted red - High delay
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

    // ✈️ Step 5: Add flight routes between cities with curves and airplane icon
    
    // Helper function to create curved path points using arc interpolation
    const createCurvedPath = (start: [number, number], end: [number, number], points: number = 50) => {
      const path: [number, number][] = [];
      const mid = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2] as [number, number];
      
      // Calculate perpendicular offset for curve
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      const distance = Math.sqrt(dx * dx + dy * dy);
      const offset = distance * 0.15; // Curve intensity
      
      // Perpendicular direction
      const perpX = -dy / distance;
      const perpY = dx / distance;
      
      const controlPoint: [number, number] = [mid[0] + perpX * offset, mid[1] + perpY * offset];
      
      // Generate points along quadratic Bezier curve
      for (let i = 0; i <= points; i++) {
        const t = i / points;
        const mt = 1 - t;
        
        const x = mt * mt * start[0] + 2 * mt * t * controlPoint[0] + t * t * end[0];
        const y = mt * mt * start[1] + 2 * mt * t * controlPoint[1] + t * t * end[1];
        
        path.push([x, y]);
      }
      
      return path;
    };

    // Helper function to calculate bearing/angle between two points
    const calculateBearing = (start: [number, number], end: [number, number]) => {
      const lat1 = (start[0] * Math.PI) / 180;
      const lat2 = (end[0] * Math.PI) / 180;
      const dLon = ((end[1] - start[1]) * Math.PI) / 180;

      const y = Math.sin(dLon) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

      const bearing = Math.atan2(y, x) * (180 / Math.PI);
      return bearing;
    };

    // Create airplane icon SVG (top-down view)
    const createAirplaneIcon = (bearing: number, color: string, size: number = 30) => {
      const svg = `
        <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <g transform="rotate(${bearing + 90} 20 20)">
            <!-- Fuselage -->
            <rect x="18" y="8" width="4" height="24" fill="${color}"/>
            <!-- Left Wing -->
            <rect x="8" y="16" width="12" height="4" fill="${color}"/>
            <!-- Right Wing -->
            <rect x="20" y="16" width="12" height="4" fill="${color}"/>
            <!-- Tail Left -->
            <polygon points="18,30 16,32 18,36" fill="${color}"/>
            <!-- Tail Right -->
            <polygon points="22,30 24,32 22,36" fill="${color}"/>
            <!-- Nose -->
            <polygon points="18,8 20,6 22,8" fill="${color}"/>
          </g>
        </svg>
      `;
      return svg;
    };

    mapConfig.flightRoutes.forEach((route) => {
      const fromCity = cities.find(c => c.name === route.from);
      const toCity = cities.find(c => c.name === route.to);
      const isSelectedRoute =
        (route.from === selectedFrom && route.to === selectedTo) ||
        (route.from === selectedTo && route.to === selectedFrom);
      const isHighlightedRoute = route.highlighted || isSelectedRoute;

      if (fromCity && toCity) {
        // Create curved path
        const curvedPath = createCurvedPath(fromCity.coordinates, toCity.coordinates);
        
        const flightPath = L.polyline(curvedPath, {
          color: isHighlightedRoute ? '#ff6b6b' : '#3b82f6',
          weight: isHighlightedRoute ? 3 : 2,
          opacity: isHighlightedRoute ? 0.9 : 0.6,
          dashArray: '8, 6',
        }).addTo(map);

        // Add airplane icon at midpoint
        const midIndex = Math.floor(curvedPath.length / 2);
        const midPoint = curvedPath[midIndex];
        
        const bearing = calculateBearing(fromCity.coordinates, toCity.coordinates);
        const iconColor = isHighlightedRoute ? '#ff6b6b' : '#3b82f6';
        const svgIcon = createAirplaneIcon(bearing, iconColor, isHighlightedRoute ? 36 : 30);
        
        const airplaneIcon = L.divIcon({
          className: 'airplane-icon',
          html: svgIcon,
          iconSize: [isHighlightedRoute ? 36 : 30, isHighlightedRoute ? 36 : 30],
          iconAnchor: [isHighlightedRoute ? 18 : 15, isHighlightedRoute ? 18 : 15]
        });
        
        L.marker(midPoint, { icon: airplaneIcon }).addTo(map);

        const routeType = isHighlightedRoute ? '⭐ Selected Route' : 'Flight Route';
        flightPath.bindPopup(`
          <div style="text-align: center;">
            <h4>✈️ ${routeType}</h4>
            <p><strong>${route.from} → ${route.to}</strong></p>
            <p style="font-size: 12px; color: #666;">Click markers for weather details</p>
          </div>
        `);
      }
    });

    const selectedRouteExists = mapConfig.flightRoutes.some(route =>
      (route.from === selectedFrom && route.to === selectedTo) ||
      (route.from === selectedTo && route.to === selectedFrom)
    );

    if (selectedFrom && selectedTo && selectedFrom !== selectedTo && !selectedRouteExists) {
      const fromCity = cities.find(c => c.name === selectedFrom);
      const toCity = cities.find(c => c.name === selectedTo);
      if (fromCity && toCity) {
        const curvedPath = createCurvedPath(fromCity.coordinates, toCity.coordinates);
        
        L.polyline(curvedPath, {
          color: '#ff6b6b',
          weight: 3,
          opacity: 0.9,
          dashArray: '8, 6',
        }).addTo(map);
        
        // Add airplane icon at midpoint for selected route
        const midIndex = Math.floor(curvedPath.length / 2);
        const midPoint = curvedPath[midIndex];
        
        const bearing = calculateBearing(fromCity.coordinates, toCity.coordinates);
        const svgIcon = createAirplaneIcon(bearing, '#ff6b6b', 36);
        
        const airplaneIcon = L.divIcon({
          className: 'airplane-icon',
          html: svgIcon,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
        
        L.marker(midPoint, { icon: airplaneIcon }).addTo(map);
      }
    }

    // 🧹 Cleanup function (runs when component is removed)
    // Remove the map from memory to prevent memory leaks
    return () => {
      map.remove();
    };
  }, [cities, mapConfig, selectedFrom, selectedTo]); // Re-run when any data changes

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
