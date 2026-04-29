


import { useEffect, useMemo, useState } from "react";
import { Card, Metric, Text, Title, LineChart, DonutChart } from "@tremor/react";
import MapComponent from "./MapComponent";

interface FlightRoute {
  from: string;
  to: string;
  color: string;
  weight: number;
  opacity: number;
  highlighted?: boolean;
}

interface MapConfig {
  center: [number, number];
  zoom: number;
  flightRoutes: FlightRoute[];
}

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
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-cyan-400 dark:drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">{city.name}</h2>

      <Card className="max-w-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-cyan-500 dark:shadow-[0_0_15px_rgba(34,211,238,0.3)]">
        <Title className="text-gray-900 dark:text-cyan-300 dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">Air Quality</Title>
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

      <Card className="max-w-xs mx-auto mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-green-500 dark:shadow-[0_0_15px_rgba(34,197,94,0.3)]">
        <Text className="text-gray-900 dark:text-green-300 dark:drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">Temperature</Text>
        <Metric className="text-gray-900 dark:text-green-400 dark:drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">{city.temperature}°C</Metric>
      </Card>

      <Card className="max-w-xs mx-auto mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-blue-500 dark:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
        <Text className="text-gray-900 dark:text-blue-300 dark:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">Humidity</Text>
        <Metric className="text-gray-900 dark:text-blue-400 dark:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">{city.humidity}%</Metric>
      </Card>

      <Card className="max-w-xs mx-auto mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-red-500 dark:shadow-[0_0_15px_rgba(239,68,68,0.3)]">
        <Text className="text-gray-900 dark:text-red-300 dark:drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">Flights Delayed</Text>
        <Metric className="text-gray-900 dark:text-red-400 dark:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">{flights.delayedFlights}</Metric>
      </Card>

      <Card className="max-w-xs mx-auto mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-yellow-500 dark:shadow-[0_0_15px_rgba(234,179,8,0.3)]">
        <Text className="text-gray-900 dark:text-yellow-300 dark:drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">Avg Delay</Text>
        <Metric className="text-gray-900 dark:text-yellow-400 dark:drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">{flights.avgDelay} min</Metric>
      </Card>

      <Card className="max-w-xs mx-auto mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-purple-500 dark:shadow-[0_0_15px_rgba(147,51,234,0.3)]">
        <Text className="text-gray-900 dark:text-purple-300 dark:drop-shadow-[0_0_8px_rgba(147,51,234,0.6)]">Weather Severity</Text>
        <Metric className="text-gray-900 dark:text-purple-400 dark:drop-shadow-[0_0_10px_rgba(147,51,234,0.8)]">{getSeverity(city)}</Metric>
      </Card>
    </div>
  );
};

function App() {
  const [cities, setCities] = useState<any[]>([]);
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null);
  const [selectedFrom, setSelectedFrom] = useState<string>("Bangalore");
  const [selectedTo, setSelectedTo] = useState<string>("Delhi");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

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
      ], totalFlights: 150, delayedFlights: 48, avgDelay: 32 },
      { name: "Mumbai", temperature: 32, humidity: 72, airQuality: 4.1, coordinates: [19.0760, 72.8777], daily: [
        { date: "2024-01-01", temp: 31, humidity: 75 },
        { date: "2024-01-02", temp: 33, humidity: 70 }
      ], totalFlights: 140, delayedFlights: 35, avgDelay: 22 },
      { name: "Chennai", temperature: 30, humidity: 68, airQuality: 5.9, coordinates: [13.0827, 80.2707], daily: [
        { date: "2024-01-01", temp: 29, humidity: 70 },
        { date: "2024-01-02", temp: 31, humidity: 65 }
      ], totalFlights: 110, delayedFlights: 28, avgDelay: 20 },
      { name: "Kolkata", temperature: 31, humidity: 62, airQuality: 3.8, coordinates: [22.5726, 88.3639], daily: [
        { date: "2024-01-01", temp: 30, humidity: 65 },
        { date: "2024-01-02", temp: 32, humidity: 60 }
      ], totalFlights: 100, delayedFlights: 32, avgDelay: 25 },
      { name: "Hyderabad", temperature: 28, humidity: 58, airQuality: 5.5, coordinates: [17.3850, 78.4867], daily: [
        { date: "2024-01-01", temp: 27, humidity: 60 },
        { date: "2024-01-02", temp: 29, humidity: 55 }
      ], totalFlights: 90, delayedFlights: 18, avgDelay: 15 },
      { name: "Pune", temperature: 26, humidity: 60, airQuality: 7.2, coordinates: [18.5204, 73.8567], daily: [
        { date: "2024-01-01", temp: 25, humidity: 62 },
        { date: "2024-01-02", temp: 27, humidity: 58 }
      ], totalFlights: 80, delayedFlights: 12, avgDelay: 10 },
      { name: "Ahmedabad", temperature: 32, humidity: 48, airQuality: 4.5, coordinates: [23.0225, 72.5714], daily: [
        { date: "2024-01-01", temp: 31, humidity: 50 },
        { date: "2024-01-02", temp: 33, humidity: 45 }
      ], totalFlights: 70, delayedFlights: 15, avgDelay: 12 },
      { name: "Jaipur", temperature: 30, humidity: 45, airQuality: 6.1, coordinates: [26.9124, 75.7873], daily: [
        { date: "2024-01-01", temp: 29, humidity: 48 },
        { date: "2024-01-02", temp: 31, humidity: 42 }
      ], totalFlights: 75, delayedFlights: 16, avgDelay: 14 },
      { name: "Lucknow", temperature: 29, humidity: 55, airQuality: 4.8, coordinates: [26.8467, 80.9462], daily: [
        { date: "2024-01-01", temp: 28, humidity: 58 },
        { date: "2024-01-02", temp: 30, humidity: 52 }
      ], totalFlights: 85, delayedFlights: 20, avgDelay: 16 }
    ];

    const majorCitiesList = [
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

    // Generate routes between all major cities
    const allFlightRoutes: FlightRoute[] = [];
    for (let i = 0; i < majorCitiesList.length; i++) {
      for (let j = i + 1; j < majorCitiesList.length; j++) {
        allFlightRoutes.push({
          from: majorCitiesList[i].name,
          to: majorCitiesList[j].name,
          color: "#3b82f6",
          weight: 2,
          opacity: 0.6
        });
      }
    }

    const fallbackMapConfig: MapConfig = {
      center: [20.5937, 78.9629],
      zoom: 5,
      flightRoutes: allFlightRoutes
    };

    try {
      const weatherPromises = majorCitiesList.map(city =>
        fetch(`https://wttr.in/${city.name}?format=j1`)
          .then(r => r.json())
          .catch(() => null)
      );

      const weatherData = await Promise.all(weatherPromises);

      // Process cities with real data
      const processedCities = majorCitiesList.map((city, index) => {
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
      // Set real data
      setCities(processedCities);
      setMapConfig(fallbackMapConfig);

    } catch (error) {
      console.log('Using fallback data:', error);
      // Set fallback data
      setCities(fallbackCities);
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

  useEffect(() => {
    if (selectedFrom === selectedTo && cities.length > 1) {
      const nextCity = cities.find(c => c.name !== selectedFrom)?.name;
      if (nextCity) {
        setSelectedTo(nextCity);
      }
    }
  }, [selectedFrom, selectedTo, cities]);

  const selectedFromCity = cities.find(c => c.name === selectedFrom);
  const selectedToCity = cities.find(c => c.name === selectedTo);

  const chartData = useMemo(() => {
    if (!selectedFromCity || !selectedToCity) return [];

    return selectedFromCity.daily.map(({ date, temp }: any) => {
      const toDay = selectedToCity.daily.find((d: any) => d.date === date);
      return {
        date,
        [selectedFrom]: temp,
        [selectedTo]: toDay?.temp
      };
    });
  }, [selectedFromCity, selectedToCity, selectedFrom, selectedTo]);

  const selectedImpactData = useMemo(() => {
    if (!selectedFromCity || !selectedToCity) return [];

    const avgSeverity = (getSeverity(selectedFromCity) + getSeverity(selectedToCity)) / 2;

    return ["Mon", "Tue", "Wed", "Thu", "Fri"].map(day => ({
      day,
      delay: Math.min(Math.floor(avgSeverity * 2 + Math.random() * 10), 50),
      severity: Math.floor(avgSeverity)
    }));
  }, [selectedFromCity, selectedToCity]);

  const mapConfigWithSelection = useMemo(() => {
    if (!mapConfig) return mapConfig;

    const selectedRouteExists = mapConfig.flightRoutes.some(route =>
      (route.from === selectedFrom && route.to === selectedTo) ||
      (route.from === selectedTo && route.to === selectedFrom)
    );

    const updatedRoutes = mapConfig.flightRoutes.map(route => ({
      ...route,
      highlighted: (route.from === selectedFrom && route.to === selectedTo) ||
        (route.from === selectedTo && route.to === selectedFrom)
    }));

    if (selectedFrom !== selectedTo && !selectedRouteExists) {
      updatedRoutes.push({
        from: selectedFrom,
        to: selectedTo,
        color: "#ff6b6b",
        weight: 4,
        opacity: 0.9,
        highlighted: true
      });
    }

    return {
      ...mapConfig,
      flightRoutes: updatedRoutes
    };
  }, [mapConfig, selectedFrom, selectedTo]);

  if (!cities || cities.length === 0 || !selectedFromCity || !selectedToCity || !mapConfigWithSelection) {
    return <div className="p-6">Loading...</div>;
  }

  // 📊 KPI Calculations (moved after loading check)
  const totalFlights = selectedFromCity.totalFlights + selectedToCity.totalFlights;
  const totalDelays = selectedFromCity.delayedFlights + selectedToCity.delayedFlights;
  const delayRate = ((totalDelays / totalFlights) * 100).toFixed(1);

  // 🔥 Worst City Logic
  const worstCity = getSeverity(selectedFromCity) > getSeverity(selectedToCity) ? selectedFromCity.name : selectedToCity.name;

  // 🧠 Insight Logic
  const insight =
    worstCity === selectedFromCity.name
      ? `${selectedFromCity.name} is currently more impacted due to weather instability.`
      : `${selectedToCity.name} is currently more impacted due to weather instability.`;

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen py-6 flex justify-center transition-colors duration-500">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Theme Toggle Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-cyan-400 dark:border dark:border-cyan-500 dark:shadow-[0_0_10px_rgba(34,211,238,0.5)] hover:bg-gray-300 dark:hover:bg-gray-700 dark:hover:shadow-[0_0_15px_rgba(34,211,238,0.8)] transition-all duration-300"
          >
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Text className="text-gray-900 dark:text-cyan-300 dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">Flight From</Text>
          <select
            value={selectedFrom}
            onChange={(e) => setSelectedFrom(e.target.value)}
            className="mt-2 block w-full rounded border border-gray-300 dark:border-cyan-500 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-cyan-400 dark:shadow-[0_0_10px_rgba(34,211,238,0.3)] focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-300"
          >
            {cities.map((city) => (
              <option key={city.name} value={city.name} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-cyan-400">
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Text className="text-gray-900 dark:text-green-300 dark:drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">Flight To</Text>
          <select
            value={selectedTo}
            onChange={(e) => setSelectedTo(e.target.value)}
            className="mt-2 block w-full rounded border border-gray-300 dark:border-green-500 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-green-400 dark:shadow-[0_0_10px_rgba(34,197,94,0.3)] focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-300"
          >
            {cities
              .filter((city) => city.name !== selectedFrom)
              .map((city) => (
                <option key={city.name} value={city.name} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-green-400">
                  {city.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* 📊 KPI Section */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8 justify-items-center">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-blue-500 dark:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Text className="text-gray-900 dark:text-blue-300 dark:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">Total Flights</Text>
          <Metric className="text-gray-900 dark:text-blue-400 dark:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">{totalFlights}</Metric>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-red-500 dark:shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          <Text className="text-gray-900 dark:text-red-300 dark:drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">Total Delays</Text>
          <Metric className="text-gray-900 dark:text-red-400 dark:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">{totalDelays}</Metric>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-yellow-500 dark:shadow-[0_0_15px_rgba(234,179,8,0.3)]">
          <Text className="text-gray-900 dark:text-yellow-300 dark:drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">Delay Rate</Text>
          <Metric className="text-gray-900 dark:text-yellow-400 dark:drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">{delayRate}%</Metric>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-purple-500 dark:shadow-[0_0_15px_rgba(147,51,234,0.3)]">
          <Text className="text-gray-900 dark:text-purple-300 dark:drop-shadow-[0_0_8px_rgba(147,51,234,0.6)]">Worst City</Text>
          <Metric className="text-gray-900 dark:text-purple-400 dark:drop-shadow-[0_0_10px_rgba(147,51,234,0.8)]">{worstCity}</Metric>
        </Card>
      </div>

      {/* 🗺️ Weather Map */}
      <Card className="mt-8 max-w-4xl mx-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-cyan-500 dark:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
        <Title className="text-gray-900 dark:text-cyan-300 dark:drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]">🗺️ Live Weather Map</Title>
        <div className="mt-6">
          <MapComponent cities={cities} mapConfig={mapConfigWithSelection} selectedFrom={selectedFrom} selectedTo={selectedTo} />
        </div>
      </Card>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 justify-items-center">

        <CityCard city={selectedFromCity} flights={selectedFromCity} />
        <CityCard city={selectedToCity} flights={selectedToCity} />

      </div>

      {/* 📈 Temperature Chart */}
      <Card className="mt-8 max-w-4xl mx-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-green-500 dark:shadow-[0_0_20px_rgba(34,197,94,0.4)]">
        <Title className="text-gray-900 dark:text-green-300 dark:drop-shadow-[0_0_10px_rgba(34,197,94,0.7)]">Weekly Temperature Comparison</Title>
        <LineChart
          className="mt-6"
          data={chartData}
          index="date"
          categories={[selectedFrom, selectedTo]}
          colors={["blue", "red"]}
          yAxisWidth={50}
        />
      </Card>


      {/* 📊 Impact Chart */}
      <Card className="mt-8 max-w-4xl mx-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-yellow-500 dark:shadow-[0_0_20px_rgba(234,179,8,0.4)]">
        <Title className="text-gray-900 dark:text-yellow-300 dark:drop-shadow-[0_0_10px_rgba(234,179,8,0.7)]">Weather vs Flight Delay</Title>
        <LineChart
          className="mt-6"
          data={selectedImpactData}
          index="day"
          categories={["delay", "severity"]}
          colors={["red", "blue"]}
        />
      </Card>

      {/* 🧠 Insights */}
      <Card className="mt-8 bg-blue-50 dark:bg-gray-900 max-w-4xl mx-auto border-gray-200 dark:border-pink-500 dark:shadow-[0_0_20px_rgba(236,72,153,0.4)]">
        <Title className="text-gray-900 dark:text-pink-300 dark:drop-shadow-[0_0_10px_rgba(236,72,153,0.7)]">Insights</Title>
        <Text className="mt-4 text-gray-900 dark:text-pink-400 dark:drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]">{insight}</Text>
      </Card>
    </div>
  </div>
  );
}

export default App;
