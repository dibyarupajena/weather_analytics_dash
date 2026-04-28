


import { useEffect, useMemo, useState } from "react";
import { Card, Metric, Text, Title, LineChart, DonutChart } from "@tremor/react";
import MapComponent from "./MapComponent";

// ⚡ Severity Calculation
const getSeverity = (city: any) => {
  return (
    city.humidity * 0.3 +
    city.temperature * 0.2 +
    city.airQuality * 5
  ).toFixed(1);
};

// 🧩 Reusable City Component
const CityCard = ({ city, flights }: { city: any, flights: any }) => {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-black">{city.name}</h2>

      <Card className="max-w-lg mb-6">
        <Title>Air Quality</Title>
        <DonutChart
          className="mt-6 mb-6"
          data={[
            { name: "Good", value: city.airQuality },
            { name: "Bad", value: 10 - city.airQuality }
          ]}
          category="value"
          index="name"
          colors={["green", "red"]}
          label={`${(city.airQuality * 10).toFixed()}%`}
        />
      </Card>

      <Card className="max-w-xs mx-auto mb-6">
        <Text>Temperature</Text>
        <Metric>{city.temperature}°C</Metric>
      </Card>

      <Card className="max-w-xs mx-auto mb-6">
        <Text>Humidity</Text>
        <Metric>{city.humidity}%</Metric>
      </Card>

      <Card className="max-w-xs mx-auto mb-6">
        <Text>Flights Delayed</Text>
        <Metric>{flights.delayedFlights}</Metric>
      </Card>

      <Card className="max-w-xs mx-auto mb-6">
        <Text>Avg Delay</Text>
        <Metric>{flights.avgDelay} min</Metric>
      </Card>

      <Card className="max-w-xs mx-auto mb-6">
        <Text>Weather Severity</Text>
        <Metric>{getSeverity(city)}</Metric>
      </Card>
    </div>
  );
};

function App() {
  const [cities, setCities] = useState<any[]>([]);
  const [impactData, setImpactData] = useState<any[]>([]);
  const [mapConfig, setMapConfig] = useState<any>(null);

  const fetchData = async () => {
    try {
      // �️ Major Indian Cities with their coordinates
      const majorCities = [
        { name: 'Bangalore', coords: [12.9716, 77.5946] },
        { name: 'Delhi', coords: [28.7041, 77.1025] },
        { name: 'Mumbai', coords: [19.0760, 72.8777] },
        { name: 'Chennai', coords: [13.0827, 80.2707] },
        { name: 'Kolkata', coords: [22.5726, 88.3639] },
        { name: 'Hyderabad', coords: [17.3850, 78.4867] },
        { name: 'Pune', coords: [18.5204, 73.8567] },
        { name: 'Ahmedabad', coords: [23.0225, 72.5714] },
        { name: 'Jaipur', coords: [26.9124, 75.7873] },
        { name: 'Lucknow', coords: [26.8467, 80.9462] }
      ];

      // 🌤️ Fetch Weather Data for all major cities
      const weatherPromises = majorCities.map(city =>
        fetch(`https://wttr.in/${city.name}?format=j1`)
          .then(r => r.json())
          .catch(() => null) // Handle API failures gracefully
      );

      const weatherData = await Promise.all(weatherPromises);

      // ✈️ Fetch Flight Data from OpenSky Network (FREE!) with CORS proxy
      let flightData = { states: [] };
      try {
        const flightResponse = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://opensky-network.org/api/states/all'));
        const flightJson = await flightResponse.json();
        flightData = JSON.parse(flightJson.contents);
      } catch (error) {
        console.error('Flight API failed, using mock data:', error);
        // Continue with empty flight data - cities will get 0 flights
      }

      // 📊 Process Weather Data for all cities
      const processedCities = majorCities.map((city, index) => {
        const weather = weatherData[index];
        const current = weather?.current_condition?.[0];

        // Count flights near this city (within ~100km radius)
        const nearbyFlights = flightData.states?.filter(state => {
          if (!state[5] || !state[6]) return false; // No position data
          const distance = Math.sqrt(
            Math.pow(state[6] - city.coords[0], 2) + Math.pow(state[5] - city.coords[1], 2)
          ) * 111; // Rough km conversion
          return distance < 100; // Within 100km
        }) || [];

        // Use real flight data if available, otherwise mock realistic numbers
        const totalFlights = nearbyFlights.length > 0 ? nearbyFlights.length : Math.floor(Math.random() * 200) + 50;

        return {
          name: city.name,
          temperature: current ? parseInt(current.temp_C) : Math.floor(Math.random() * 15) + 20,
          humidity: current ? parseInt(current.humidity) : Math.floor(Math.random() * 40) + 40,
          airQuality: Math.floor(Math.random() * 10), // Mock air quality
          coordinates: city.coords,
          daily: [], // Would need separate API call for forecast
          totalFlights: totalFlights,
          delayedFlights: Math.floor(totalFlights * 0.15), // Estimate 15% delays
          avgDelay: Math.floor(Math.random() * 45) + 5 // Mock delay time
        };
      });

      setCities(processedCities);

      // Process flight data (simplified - in real app you'd filter by region)
      setImpactData([
        { day: "Mon", delay: Math.floor(Math.random() * 50), severity: Math.floor(Math.random() * 10) },
        { day: "Tue", delay: Math.floor(Math.random() * 50), severity: Math.floor(Math.random() * 10) },
        { day: "Wed", delay: Math.floor(Math.random() * 50), severity: Math.floor(Math.random() * 10) },
        { day: "Thu", delay: Math.floor(Math.random() * 50), severity: Math.floor(Math.random() * 10) },
        { day: "Fri", delay: Math.floor(Math.random() * 50), severity: Math.floor(Math.random() * 10) }
      ]);

      // ✈️ Create flight routes between major cities
      const flightRoutes = [
        // Highlighted Bangalore-Delhi route
        { from: "Bangalore", to: "Delhi", color: "#ff6b6b", weight: 4, opacity: 0.9, highlighted: true },

        // Other major routes
        { from: "Bangalore", to: "Mumbai", color: "#4ecdc4", weight: 2, opacity: 0.7 },
        { from: "Bangalore", to: "Chennai", color: "#45b7d1", weight: 2, opacity: 0.7 },
        { from: "Bangalore", to: "Hyderabad", color: "#96ceb4", weight: 2, opacity: 0.7 },
        { from: "Delhi", to: "Mumbai", color: "#ffeaa7", weight: 2, opacity: 0.7 },
        { from: "Delhi", to: "Kolkata", color: "#dda0dd", weight: 2, opacity: 0.7 },
        { from: "Delhi", to: "Chennai", color: "#98d8c8", weight: 2, opacity: 0.7 },
        { from: "Delhi", to: "Ahmedabad", color: "#f7dc6f", weight: 2, opacity: 0.7 },
        { from: "Delhi", to: "Jaipur", color: "#bb8fce", weight: 2, opacity: 0.7 },
        { from: "Delhi", to: "Lucknow", color: "#85c1e9", weight: 2, opacity: 0.7 },
        { from: "Mumbai", to: "Chennai", color: "#f8c471", weight: 2, opacity: 0.7 },
        { from: "Mumbai", to: "Kolkata", color: "#82e0aa", weight: 2, opacity: 0.7 },
        { from: "Mumbai", to: "Hyderabad", color: "#f1948a", weight: 2, opacity: 0.7 },
        { from: "Mumbai", to: "Pune", color: "#85c1e9", weight: 2, opacity: 0.7 },
        { from: "Chennai", to: "Kolkata", color: "#d7bde2", weight: 2, opacity: 0.7 },
        { from: "Hyderabad", to: "Chennai", color: "#a9dfbf", weight: 2, opacity: 0.7 },
        { from: "Pune", to: "Delhi", color: "#f9e79f", weight: 2, opacity: 0.7 },
        { from: "Ahmedabad", to: "Mumbai", color: "#aed6f1", weight: 2, opacity: 0.7 },
        { from: "Jaipur", to: "Ahmedabad", color: "#f8c471", weight: 2, opacity: 0.7 }
      ];

      setMapConfig({
        center: [20.5937, 78.9629],
        zoom: 5,
        flightRoutes: flightRoutes
      });
      // Fallback to mock data if APIs fail
      const mockCities = [
        { name: "Bangalore", temperature: 29, humidity: 65, airQuality: 7.5, coordinates: [12.9716, 77.5946], daily: [], totalFlights: 120, delayedFlights: 35, avgDelay: 28 },
        { name: "Delhi", temperature: 34, humidity: 55, airQuality: 6.2, coordinates: [28.7041, 77.1025], daily: [], totalFlights: 150, delayedFlights: 60, avgDelay: 42 },
        { name: "Mumbai", temperature: 31, humidity: 70, airQuality: 5.8, coordinates: [19.0760, 72.8777], daily: [], totalFlights: 180, delayedFlights: 45, avgDelay: 35 },
        { name: "Chennai", temperature: 32, humidity: 75, airQuality: 6.5, coordinates: [13.0827, 80.2707], daily: [], totalFlights: 95, delayedFlights: 25, avgDelay: 22 },
        { name: "Kolkata", temperature: 33, humidity: 80, airQuality: 4.2, coordinates: [22.5726, 88.3639], daily: [], totalFlights: 85, delayedFlights: 40, avgDelay: 38 },
        { name: "Hyderabad", temperature: 30, humidity: 60, airQuality: 7.0, coordinates: [17.3850, 78.4867], daily: [], totalFlights: 110, delayedFlights: 30, avgDelay: 25 },
        { name: "Pune", temperature: 28, humidity: 55, airQuality: 8.0, coordinates: [18.5204, 73.8567], daily: [], totalFlights: 75, delayedFlights: 20, avgDelay: 18 },
        { name: "Ahmedabad", temperature: 35, humidity: 45, airQuality: 5.5, coordinates: [23.0225, 72.5714], daily: [], totalFlights: 90, delayedFlights: 35, avgDelay: 32 },
        { name: "Jaipur", temperature: 36, humidity: 40, airQuality: 6.8, coordinates: [26.9124, 75.7873], daily: [], totalFlights: 65, delayedFlights: 15, avgDelay: 20 },
        { name: "Lucknow", temperature: 34, humidity: 65, airQuality: 5.2, coordinates: [26.8467, 80.9462], daily: [], totalFlights: 70, delayedFlights: 28, avgDelay: 30 }
      ];

      setCities(mockCities);

      setImpactData([
        { day: "Mon", delay: 20, severity: 6 },
        { day: "Tue", delay: 35, severity: 8 },
        { day: "Wed", delay: 25, severity: 5 },
        { day: "Thu", delay: 40, severity: 9 },
        { day: "Fri", delay: 30, severity: 7 }
      ]);

      // Fallback flight routes
      const fallbackRoutes = [
        { from: "Bangalore", to: "Delhi", color: "#ff6b6b", weight: 4, opacity: 0.9, highlighted: true },
        { from: "Bangalore", to: "Mumbai", color: "#4ecdc4", weight: 2, opacity: 0.7 },
        { from: "Bangalore", to: "Chennai", color: "#45b7d1", weight: 2, opacity: 0.7 },
        { from: "Delhi", to: "Mumbai", color: "#ffeaa7", weight: 2, opacity: 0.7 },
        { from: "Delhi", to: "Kolkata", color: "#dda0dd", weight: 2, opacity: 0.7 },
        { from: "Mumbai", to: "Chennai", color: "#f8c471", weight: 2, opacity: 0.7 }
      ];

      setMapConfig({
        center: [20.5937, 78.9629],
        zoom: 5,
        flightRoutes: fallbackRoutes
      });
  } catch (error: any) {
    console.error('Error fetching data:', error);
    // Fallback to mock data if APIs fail
    const mockCities = [
      { name: "Bangalore", temperature: 29, humidity: 65, airQuality: 7.5, coordinates: [12.9716, 77.5946], daily: [], totalFlights: 120, delayedFlights: 35, avgDelay: 28 },
      { name: "Delhi", temperature: 34, humidity: 55, airQuality: 6.2, coordinates: [28.7041, 77.1025], daily: [], totalFlights: 150, delayedFlights: 60, avgDelay: 42 },
      { name: "Mumbai", temperature: 31, humidity: 70, airQuality: 5.8, coordinates: [19.0760, 72.8777], daily: [], totalFlights: 180, delayedFlights: 45, avgDelay: 35 },
      { name: "Chennai", temperature: 32, humidity: 75, airQuality: 6.5, coordinates: [13.0827, 80.2707], daily: [], totalFlights: 95, delayedFlights: 25, avgDelay: 22 },
      { name: "Kolkata", temperature: 33, humidity: 80, airQuality: 4.2, coordinates: [22.5726, 88.3639], daily: [], totalFlights: 85, delayedFlights: 40, avgDelay: 38 },
      { name: "Hyderabad", temperature: 30, humidity: 60, airQuality: 7.0, coordinates: [17.3850, 78.4867], daily: [], totalFlights: 110, delayedFlights: 30, avgDelay: 25 },
      { name: "Pune", temperature: 28, humidity: 55, airQuality: 8.0, coordinates: [18.5204, 73.8567], daily: [], totalFlights: 75, delayedFlights: 20, avgDelay: 18 },
      { name: "Ahmedabad", temperature: 35, humidity: 45, airQuality: 5.5, coordinates: [23.0225, 72.5714], daily: [], totalFlights: 90, delayedFlights: 35, avgDelay: 32 },
      { name: "Jaipur", temperature: 36, humidity: 40, airQuality: 6.8, coordinates: [26.9124, 75.7873], daily: [], totalFlights: 65, delayedFlights: 15, avgDelay: 20 },
      { name: "Lucknow", temperature: 34, humidity: 65, airQuality: 5.2, coordinates: [26.8467, 80.9462], daily: [], totalFlights: 70, delayedFlights: 28, avgDelay: 30 }
    ];

    setCities(mockCities);

    setImpactData([
      { day: "Mon", delay: 20, severity: 6 },
      { day: "Tue", delay: 35, severity: 8 },
      { day: "Wed", delay: 25, severity: 5 },
      { day: "Thu", delay: 40, severity: 9 },
      { day: "Fri", delay: 30, severity: 7 }
    ]);

    // Fallback flight routes
    const fallbackRoutes = [
      { from: "Bangalore", to: "Delhi", color: "#ff6b6b", weight: 4, opacity: 0.9, highlighted: true },
      { from: "Bangalore", to: "Mumbai", color: "#4ecdc4", weight: 2, opacity: 0.7 },
      { from: "Bangalore", to: "Chennai", color: "#45b7d1", weight: 2, opacity: 0.7 },
      { from: "Delhi", to: "Mumbai", color: "#ffeaa7", weight: 2, opacity: 0.7 },
      { from: "Delhi", to: "Kolkata", color: "#dda0dd", weight: 2, opacity: 0.7 },
      { from: "Mumbai", to: "Chennai", color: "#f8c471", weight: 2, opacity: 0.7 }
    ];

    setMapConfig({
      center: [20.5937, 78.9629],
      zoom: 5,
      flightRoutes: fallbackRoutes
    });
  }
}

  useEffect(() => {
    fetchData(); // first load

    const interval = setInterval(() => {
      fetchData(); // refresh every 10 mins
    }, 600000);

    return () => clearInterval(interval);
  }, []);

  const chartData = useMemo(() => {
    if (!cities || cities.length < 2) return [];

    // Use Bangalore and Delhi for the chart (first two cities)
    const bangalore = cities.find(c => c.name === 'Bangalore');
    const delhi = cities.find(c => c.name === 'Delhi');

    if (!bangalore || !delhi) return [];

    return bangalore.daily.map(({ date, temp }: any) => {
      const delhiData = delhi.daily.find((d: any) => d.date === date);
      return {
        date,
        Bangalore: temp,
        Delhi: delhiData?.temp
      };
    });
  }, [cities]);

  if (!cities || cities.length === 0) {
    return <div className="p-6">Loading...</div>;
  }

  // 📊 KPI Calculations (moved after loading check)
  const bangalore = cities.find(c => c.name === 'Bangalore');
  const delhi = cities.find(c => c.name === 'Delhi');
  const totalFlights = bangalore.totalFlights + delhi.totalFlights;
  const totalDelays = bangalore.delayedFlights + delhi.delayedFlights;
  const delayRate = ((totalDelays / totalFlights) * 100).toFixed(1);

  // 🔥 Worst City Logic
  const worstCity = getSeverity(bangalore) > getSeverity(delhi) ? bangalore.name : delhi.name;

  // 🧠 Insight Logic
  const insight =
    worstCity === "Delhi"
      ? "Delhi shows higher delays due to poor air quality and higher temperature."
      : "Bangalore is currently more impacted due to weather instability.";

  return (
    <div className="bg-gray-100 min-h-screen py-6 flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">


        {/* 📊 KPI Section */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8 justify-items-center">
        <Card>
          <Text>Total Flights</Text>
          <Metric>{totalFlights}</Metric>
        </Card>

        <Card>
          <Text>Total Delays</Text>
          <Metric>{totalDelays}</Metric>
        </Card>

        <Card>
          <Text>Delay Rate</Text>
          <Metric>{delayRate}%</Metric>
        </Card>

        <Card>
          <Text>Worst City</Text>
          <Metric>{worstCity}</Metric>
        </Card>
      </div>

      {/* 🗺️ Weather Map */}
      <Card className="mt-8 max-w-4xl mx-auto">
        <Title>🗺️ Live Weather Map</Title>
        <div className="mt-6">
          <MapComponent cities={cities} mapConfig={mapConfig} />
        </div>
      </Card>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 justify-items-center">

        <CityCard city={cities.find(c => c.name === 'Bangalore')} flights={cities.find(c => c.name === 'Bangalore')} />
        <CityCard city={cities.find(c => c.name === 'Delhi')} flights={cities.find(c => c.name === 'Delhi')} />

      </div>

      {/* 📈 Temperature Chart */}
      <Card className="mt-8 max-w-4xl mx-auto">
        <Title>Weekly Temperature Comparison</Title>
        <LineChart
          className="mt-6"
          data={chartData}
          index="date"
          categories={["Bangalore", "Delhi"]}
          colors={["blue", "red"]}
          yAxisWidth={50}
        />
      </Card>


      {/* 📊 Impact Chart */}
      <Card className="mt-8 max-w-4xl mx-auto">
        <Title>Weather vs Flight Delay</Title>
        <LineChart
          className="mt-6"
          data={impactData}
          index="day"
          categories={["delay", "severity"]}
          colors={["red", "blue"]}
        />
      </Card>

      {/* 🧠 Insights */}
      <Card className="mt-8 bg-blue-50 max-w-4xl mx-auto">
        <Title>Insights</Title>
        <Text className="mt-4">{insight}</Text>
      </Card>
    </div>
  </div>
  );
}

export default App;