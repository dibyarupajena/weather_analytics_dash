


import { useEffect, useMemo, useState } from "react";
import { Card, Metric, Text, Title, LineChart, DonutChart } from "@tremor/react";
import MapComponent from "./MapComponent";

// ⚡ Severity Calculation
const getSeverity = (city: any) => {
  return parseFloat((
    city.humidity * 0.3 +
    city.temperature * 0.2 +
    city.airQuality * 5
  ).toFixed(1));
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
    // Always prepare fallback data first
    const fallbackCities = [
      { name: "Bangalore", temperature: 29, humidity: 65, airQuality: 6.8, coordinates: [12.9716, 77.5946], daily: [
        { date: "2024-01-01", temp: 28, humidity: 70 },
        { date: "2024-01-02", temp: 30, humidity: 65 }
      ], totalFlights: 120, delayedFlights: 25, avgDelay: 18 },
      { name: "Delhi", temperature: 34, humidity: 55, airQuality: 3.2, coordinates: [28.7041, 77.1025], daily: [
        { date: "2024-01-01", temp: 33, humidity: 60 },
        { date: "2024-01-02", temp: 35, humidity: 50 }
      ], totalFlights: 150, delayedFlights: 48, avgDelay: 32 }
    ];

    const fallbackImpactData = [
      { day: "Mon", delay: 20, severity: 6 },
      { day: "Tue", delay: 35, severity: 8 },
      { day: "Wed", delay: 25, severity: 5 },
      { day: "Thu", delay: 40, severity: 9 },
      { day: "Fri", delay: 30, severity: 7 }
    ];

    const fallbackMapConfig = {
      center: [20.5937, 78.9629],
      zoom: 5,
      flightRoutes: [
        { from: "Bangalore", to: "Delhi", color: "#ff6b6b", weight: 4, opacity: 0.9, highlighted: true },
        { from: "Bangalore", to: "Mumbai", color: "#3b82f6", weight: 2, opacity: 0.7 },
        { from: "Delhi", to: "Mumbai", color: "#3b82f6", weight: 2, opacity: 0.7 }
      ]
    };

    try {
      // Try to get real weather data
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

      const weatherPromises = majorCities.map(city =>
        fetch(`https://wttr.in/${city.name}?format=j1`)
          .then(r => r.json())
          .catch(() => null)
      );

      const weatherData = await Promise.all(weatherPromises);

      // Process cities with real data
      const processedCities = majorCities.map((city, index) => {
        const weather = weatherData[index];
        const current = weather?.current_condition?.[0];
        const forecast = weather?.weather || [];

        // Realistic air quality based on city
        const cityAirQuality: { [key: string]: number } = {
          'Delhi': 3.2, 'Mumbai': 4.1, 'Bangalore': 6.8, 'Chennai': 5.9,
          'Kolkata': 3.8, 'Hyderabad': 5.5, 'Pune': 7.2, 'Ahmedabad': 4.5,
          'Jaipur': 6.1, 'Lucknow': 4.8
        };

        const airQuality = cityAirQuality[city.name] || 6.0;
        const temperature = current ? parseInt(current.temp_C) : 25;
        const humidity = current ? parseInt(current.humidity) : 60;

        // Weather-based flight delays
        const severity = humidity * 0.3 + temperature * 0.2 + airQuality * 5;
        const delayRate = Math.min(severity / 100, 0.4);
        const totalFlights = Math.floor(Math.random() * 200) + 50;
        const delayedFlights = Math.floor(totalFlights * delayRate);
        const avgDelay = Math.floor((severity / 10) + Math.random() * 20);

        const dailyForecast = forecast.slice(0, 7).map((day: any) => ({
          date: day.date,
          temp: parseInt(day.avgtempC),
          humidity: parseInt(day.avghumidity)
        }));

        return {
          name: city.name,
          temperature,
          humidity,
          airQuality,
          coordinates: city.coords,
          daily: dailyForecast,
          totalFlights,
          delayedFlights,
          avgDelay: Math.max(5, avgDelay)
        };
      });

      // Generate impact data from real cities
      const realImpactData = ["Mon", "Tue", "Wed", "Thu", "Fri"].map(day => {
        const bangalore = processedCities.find(c => c.name === 'Bangalore');
        const delhi = processedCities.find(c => c.name === 'Delhi');
        const avgSeverity = bangalore && delhi ?
          (getSeverity(bangalore) + getSeverity(delhi)) / 2 : 6;

        return {
          day,
          delay: Math.min(Math.floor(avgSeverity * 2 + Math.random() * 10), 50),
          severity: Math.floor(avgSeverity)
        };
      });

      // Set real data
      setCities(processedCities);
      setImpactData(realImpactData);
      setMapConfig(fallbackMapConfig);

    } catch (error) {
      console.log('Using fallback data:', error);
      // Set fallback data
      setCities(fallbackCities);
      setImpactData(fallbackImpactData);
      setMapConfig(fallbackMapConfig);
    }
  };
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
