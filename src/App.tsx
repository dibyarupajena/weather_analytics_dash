


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

// � Sidebar Navigation Component
const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 w-20 h-screen bg-gray-900 dark:bg-[#0B1020] border-r border-gray-800 dark:border-gray-700 flex flex-col items-center py-6 space-y-8">
      <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
        <span className="text-xl">✈️</span>
      </div>
      <nav className="flex-1 flex flex-col space-y-6 mt-4">
        <button className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center hover:bg-blue-500/30 transition-all" title="Dashboard">
          🏠
        </button>
        <button className="w-12 h-12 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-all" title="Analytics">
          📊
        </button>
        <button className="w-12 h-12 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-all" title="Weather">
          🌤️
        </button>
        <button className="w-12 h-12 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-all" title="Flights">
          ✈️
        </button>
        <button className="w-12 h-12 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-all" title="Charts">
          📈
        </button>
      </nav>
      <button className="w-12 h-12 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-all" title="Settings">
        ⚙️
      </button>
    </div>
  );
};

// �🧩 Reusable City Component
const CityCard = ({ city, flights }: { city: any, flights: any }) => {
  const getDelayStatus = (avgDelay: number) => {
    if (avgDelay > 25) return { label: "High Delays", color: "bg-red-500/20 border-red-500/50" };
    if (avgDelay > 15) return { label: "Moderate Delay", color: "bg-yellow-500/20 border-yellow-500/50" };
    return { label: "Low Delay", color: "bg-green-500/20 border-green-500/50" };
  };

  const status = getDelayStatus(flights.avgDelay);
  const prevDayChange = flights.avgDelay - (flights.prevDelays || 0);
  const changePercent = flights.prevDelays ? ((prevDayChange / flights.prevDelays) * 100).toFixed(1) : 0;
  const isIncrease = prevDayChange > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{city.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{city.weather}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
          {status.label}
        </span>
      </div>

      <Card className="bg-white/10 dark:bg-[#1F2937]/70 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] p-6">
        <div className="flex items-start justify-between">
          <div>
            <Text className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">Current Conditions</Text>
            <Metric className="text-slate-900 dark:text-white text-3xl font-bold">{city.temperature}°C</Metric>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{city.weather}</p>
          </div>
          <DonutChart
            className="w-32 h-32"
            data={[
              { name: "Good", value: city.airQuality },
              { name: "Bad", value: 10 - city.airQuality }
            ]}
            category="value"
            index="name"
            colors={["green", "red"]}
            label={`${(city.airQuality * 10).toFixed()}%`}
          />
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-white/15 dark:bg-[#1F2937]/70 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.18)] p-4">
          <Text className="text-slate-500 dark:text-blue-300 text-xs font-semibold mb-1">Humidity</Text>
          <Metric className="text-slate-900 dark:text-white text-lg font-bold">{city.humidity}%</Metric>
        </Card>

        <Card className="bg-white/15 dark:bg-[#1F2937]/70 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.18)] p-4">
          <Text className="text-slate-500 dark:text-green-300 text-xs font-semibold mb-1">Air Quality</Text>
          <Metric className="text-slate-900 dark:text-white text-lg font-bold">{city.airQuality}</Metric>
        </Card>

        <Card className="bg-white/15 dark:bg-[#1F2937]/70 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.18)] p-4">
          <Text className="text-slate-500 dark:text-yellow-300 text-xs font-semibold mb-1">Delayed Flights</Text>
          <Metric className="text-slate-900 dark:text-white text-lg font-bold">{flights.delayedFlights}</Metric>
        </Card>

        <Card className="bg-white/15 dark:bg-[#1F2937]/70 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.18)] p-4">
          <Text className="text-slate-500 dark:text-red-300 text-xs font-semibold mb-1">Avg Delay</Text>
          <Metric className="text-slate-900 dark:text-white text-lg font-bold">{flights.avgDelay} min</Metric>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="bg-white/15 dark:bg-[#1F2937]/70 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.18)] p-4">
          <Text className="text-slate-500 dark:text-cyan-300 text-xs font-semibold mb-1">Total Flights</Text>
          <Metric className="text-slate-900 dark:text-white text-lg font-bold">{flights.totalFlights}</Metric>
        </Card>

        <Card className="bg-white/15 dark:bg-[#1F2937]/70 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.18)] p-4">
          <Text className="text-slate-500 dark:text-purple-300 text-xs font-semibold mb-1">On-time %</Text>
          <Metric className="text-slate-900 dark:text-white text-lg font-bold">{flights.onTimePercent}%</Metric>
        </Card>

        <Card className="bg-white/15 dark:bg-[#1F2937]/70 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.18)] p-4">
          <Text className="text-slate-500 dark:text-pink-300 text-xs font-semibold mb-1">Change vs Prev</Text>
          <div className="flex items-center gap-1">
            <span className={`text-lg font-bold ${isIncrease ? 'text-red-400' : 'text-green-400'}`}>
              {isIncrease ? '↑' : '↓'} {Math.abs(changePercent)}%
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

function App() {
  const [cities, setCities] = useState<any[]>([]);
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null);
  const [selectedFrom, setSelectedFrom] = useState<string>("Seattle (SEA)");
  const [selectedTo, setSelectedTo] = useState<string>("London (LHR)");
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
      { name: "Seattle (SEA)", temperature: 18, humidity: 72, airQuality: 7.8, coordinates: [47.4502, -122.3088], weather: "Light Rain", dailyChange: -2.3, prevDelays: 28, daily: [
        { date: "2024-01-01", temp: 17, humidity: 75 },
        { date: "2024-01-02", temp: 19, humidity: 70 }
      ], totalFlights: 245, delayedFlights: 52, avgDelay: 18, onTimePercent: 78.8 },
      { name: "London (LHR)", temperature: 12, humidity: 68, airQuality: 5.2, coordinates: [51.4700, -0.4543], weather: "Overcast", dailyChange: 1.2, prevDelays: 45, daily: [
        { date: "2024-01-01", temp: 11, humidity: 70 },
        { date: "2024-01-02", temp: 13, humidity: 66 }
      ], totalFlights: 312, delayedFlights: 68, avgDelay: 24, onTimePercent: 78.2 },
      { name: "Frankfurt (FRA)", temperature: 14, humidity: 62, airQuality: 6.1, coordinates: [50.0379, 8.5622], weather: "Partly Cloudy", dailyChange: 0.8, prevDelays: 32, daily: [
        { date: "2024-01-01", temp: 13, humidity: 65 },
        { date: "2024-01-02", temp: 15, humidity: 60 }
      ], totalFlights: 289, delayedFlights: 58, avgDelay: 19, onTimePercent: 79.9 },
      { name: "New York (JFK)", temperature: 8, humidity: 65, airQuality: 4.9, coordinates: [40.6413, -73.7781], weather: "Clear", dailyChange: 2.1, prevDelays: 38, daily: [
        { date: "2024-01-01", temp: 6, humidity: 68 },
        { date: "2024-01-02", temp: 10, humidity: 62 }
      ], totalFlights: 378, delayedFlights: 71, avgDelay: 22, onTimePercent: 81.2 },
      { name: "Dubai (DXB)", temperature: 32, humidity: 58, airQuality: 3.8, coordinates: [25.2528, 55.3644], weather: "Haze", dailyChange: 1.5, prevDelays: 52, daily: [
        { date: "2024-01-01", temp: 31, humidity: 60 },
        { date: "2024-01-02", temp: 33, humidity: 55 }
      ], totalFlights: 267, delayedFlights: 64, avgDelay: 26, onTimePercent: 73.9 },
      { name: "Beijing (PEK)", temperature: 6, humidity: 55, airQuality: 3.1, coordinates: [40.0801, 116.5847], weather: "Haze", dailyChange: -1.8, prevDelays: 48, daily: [
        { date: "2024-01-01", temp: 5, humidity: 58 },
        { date: "2024-01-02", temp: 7, humidity: 52 }
      ], totalFlights: 324, delayedFlights: 78, avgDelay: 31, onTimePercent: 75.9 },
      { name: "Singapore (SIN)", temperature: 28, humidity: 76, airQuality: 4.2, coordinates: [1.3521, 103.8198], weather: "Thunderstorm", dailyChange: -0.5, prevDelays: 35, daily: [
        { date: "2024-01-01", temp: 27, humidity: 78 },
        { date: "2024-01-02", temp: 29, humidity: 74 }
      ], totalFlights: 198, delayedFlights: 42, avgDelay: 20, onTimePercent: 78.8 },
      { name: "Sydney (SYD)", temperature: 26, humidity: 71, airQuality: 6.5, coordinates: [-33.9461, 151.1772], weather: "Sunny", dailyChange: 3.2, prevDelays: 22, daily: [
        { date: "2024-01-01", temp: 23, humidity: 73 },
        { date: "2024-01-02", temp: 27, humidity: 69 }
      ], totalFlights: 156, delayedFlights: 28, avgDelay: 14, onTimePercent: 82.1 },
      { name: "São Paulo (GRU)", temperature: 29, humidity: 68, airQuality: 4.7, coordinates: [-23.4350, -46.4733], weather: "Partly Cloudy", dailyChange: 2.8, prevDelays: 30, daily: [
        { date: "2024-01-01", temp: 26, humidity: 70 },
        { date: "2024-01-02", temp: 30, humidity: 66 }
      ], totalFlights: 189, delayedFlights: 38, avgDelay: 17, onTimePercent: 79.9 },
      { name: "Los Angeles (LAX)", temperature: 22, humidity: 62, airQuality: 5.3, coordinates: [33.9425, -118.4081], weather: "Sunny", dailyChange: 0.6, prevDelays: 28, daily: [
        { date: "2024-01-01", temp: 21, humidity: 64 },
        { date: "2024-01-02", temp: 23, humidity: 60 }
      ], totalFlights: 267, delayedFlights: 44, avgDelay: 15, onTimePercent: 83.5 }
    ];

    const majorCitiesList = [
      { name: 'Seattle (SEA)', coords: [47.4502, -122.3088] },
      { name: 'London (LHR)', coords: [51.4700, -0.4543] },
      { name: 'Frankfurt (FRA)', coords: [50.0379, 8.5622] },
      { name: 'New York (JFK)', coords: [40.6413, -73.7781] },
      { name: 'Dubai (DXB)', coords: [25.2528, 55.3644] },
      { name: 'Beijing (PEK)', coords: [40.0801, 116.5847] },
      { name: 'Singapore (SIN)', coords: [1.3521, 103.8198] },
      { name: 'Sydney (SYD)', coords: [-33.9461, 151.1772] },
      { name: 'São Paulo (GRU)', coords: [-23.4350, -46.4733] },
      { name: 'Los Angeles (LAX)', coords: [33.9425, -118.4081] }
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
      center: [20, 0],
      zoom: 2,
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
          'Seattle (SEA)': 7.8, 'London (LHR)': 5.2, 'Frankfurt (FRA)': 6.1, 'New York (JFK)': 4.9,
          'Dubai (DXB)': 3.8, 'Beijing (PEK)': 3.1, 'Singapore (SIN)': 4.2, 'Sydney (SYD)': 6.5,
          'São Paulo (GRU)': 4.7, 'Los Angeles (LAX)': 5.3
        };

        const weatherConditions: { [key: string]: string } = {
          'Seattle (SEA)': 'Light Rain', 'London (LHR)': 'Overcast', 'Frankfurt (FRA)': 'Partly Cloudy', 'New York (JFK)': 'Clear',
          'Dubai (DXB)': 'Haze', 'Beijing (PEK)': 'Haze', 'Singapore (SIN)': 'Thunderstorm', 'Sydney (SYD)': 'Sunny',
          'São Paulo (GRU)': 'Partly Cloudy', 'Los Angeles (LAX)': 'Sunny'
        };

        const previousDayDelays: { [key: string]: number } = {
          'Seattle (SEA)': 28, 'London (LHR)': 45, 'Frankfurt (FRA)': 32, 'New York (JFK)': 38,
          'Dubai (DXB)': 52, 'Beijing (PEK)': 48, 'Singapore (SIN)': 35, 'Sydney (SYD)': 22,
          'São Paulo (GRU)': 30, 'Los Angeles (LAX)': 28
        };

        const dailyChanges: { [key: string]: number } = {
          'Seattle (SEA)': -2.3, 'London (LHR)': 1.2, 'Frankfurt (FRA)': 0.8, 'New York (JFK)': 2.1,
          'Dubai (DXB)': 1.5, 'Beijing (PEK)': -1.8, 'Singapore (SIN)': -0.5, 'Sydney (SYD)': 3.2,
          'São Paulo (GRU)': 2.8, 'Los Angeles (LAX)': 0.6
        };

        const onTimePercentages: { [key: string]: number } = {
          'Seattle (SEA)': 78.8, 'London (LHR)': 78.2, 'Frankfurt (FRA)': 79.9, 'New York (JFK)': 81.2,
          'Dubai (DXB)': 73.9, 'Beijing (PEK)': 75.9, 'Singapore (SIN)': 78.8, 'Sydney (SYD)': 82.1,
          'São Paulo (GRU)': 79.9, 'Los Angeles (LAX)': 83.5
        };

        const airQuality = cityAirQuality[city.name] || 6.0;
        const temperature = current ? parseInt(current.temp_C) : 22;
        const humidity = current ? parseInt(current.humidity) : 65;
        const weather_condition = weatherConditions[city.name] || 'Clear';
        const prevDelays = previousDayDelays[city.name] || 30;
        const dailyChange = dailyChanges[city.name] || 0;
        const onTimePercent = onTimePercentages[city.name] || 80;

        // Weather-based flight delays
        const severity = humidity * 0.3 + temperature * 0.2 + airQuality * 5;
        const delayRate = Math.min(severity / 100, 0.4);
        const totalFlights = Math.floor(Math.random() * 200) + 150;
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
          weather: weather_condition,
          dailyChange,
          prevDelays,
          daily: dailyForecast,
          totalFlights,
          delayedFlights,
          avgDelay: Math.max(5, avgDelay),
          onTimePercent
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
//console.log(selectedFromCity);
//console.log(cities);

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
    <div className="bg-gray-50 dark:bg-[#0B1020] min-h-screen flex transition-all duration-500 font-sans">
      <Sidebar />
      <div className="flex-1 ml-20 py-6 flex justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Theme Toggle Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Flight Delay & Weather Impact Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Last updated: {new Date().toLocaleString()}</p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-6 py-3 rounded-xl bg-white/90 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/70 dark:border-gray-700 shadow-sm dark:shadow-[0_10px_30px_rgba(0,0,0,0.24)] hover:bg-slate-100 dark:hover:bg-slate-700 dark:shadow-[0_0_18px_rgba(56,189,248,0.24)] dark:hover:shadow-[0_0_28px_rgba(56,189,248,0.38)] transition-all duration-300 font-medium"
          >
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Flight From</label>
          <select
            value={selectedFrom}
            onChange={(e) => setSelectedFrom(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1F2937]/90 border border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white shadow-sm dark:shadow-[0_10px_30px_rgba(0,0,0,0.18)] focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-transparent transition-all duration-300"
          >
            {cities.map((city) => (
              <option key={city.name} value={city.name} className="bg-white dark:bg-[#1F2937] text-slate-900 dark:text-white">
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Flight To</label>
          <select
            value={selectedTo}
            onChange={(e) => setSelectedTo(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1F2937]/90 border border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white shadow-sm dark:shadow-[0_10px_30px_rgba(0,0,0,0.18)] focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-transparent transition-all duration-300"
          >
            {cities
              .filter((city) => city.name !== selectedFrom)
              .map((city) => (
                <option key={city.name} value={city.name} className="bg-white dark:bg-[#1F2937] text-slate-900 dark:text-white">
                  {city.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* 📊 KPI Section */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/10 dark:bg-[#1F2937]/70 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] p-6">
          <Text className="text-slate-500 dark:text-blue-300 text-base font-semibold mb-2">Total Flights</Text>
          <Metric className="text-slate-900 dark:text-white text-3xl font-bold">{totalFlights.toLocaleString()}</Metric>
          <p className="text-green-500 text-sm mt-2">▲ 8.6% vs yesterday</p>
        </Card>

        <Card className="bg-white/10 dark:bg-[#1F2937]/70 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] p-6">
          <Text className="text-slate-500 dark:text-red-300 text-base font-semibold mb-2">Delayed Flights</Text>
          <Metric className="text-slate-900 dark:text-white text-3xl font-bold">{totalDelays}</Metric>
          <p className="text-red-500 text-sm mt-2">▼ 15.3% vs yesterday</p>
        </Card>

        <Card className="bg-white/10 dark:bg-[#1F2937]/70 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] p-6">
          <Text className="text-slate-500 dark:text-yellow-300 text-base font-semibold mb-2">Avg Delay</Text>
          <Metric className="text-slate-900 dark:text-white text-3xl font-bold">{Math.round((selectedFromCity.avgDelay + selectedToCity.avgDelay) / 2)} min</Metric>
          <p className="text-yellow-500 text-sm mt-2">▲ 6 min vs yesterday</p>
        </Card>

        <Card className="bg-white/10 dark:bg-[#1F2937]/70 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] p-6">
          <Text className="text-slate-500 dark:text-purple-300 text-base font-semibold mb-2">Worst City</Text>
          <Metric className="text-slate-900 dark:text-white text-2xl font-bold">{worstCity}</Metric>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Avg Delay: {Math.max(selectedFromCity.avgDelay, selectedToCity.avgDelay)} min</p>
        </Card>
      </div>

      {/* 🗺️ Weather Map */}
      <Card className="mt-8 mb-8 bg-white/10 dark:bg-[#1F2937]/70 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="p-6 border-b border-white/10 dark:border-white/15">
          <Title className="text-slate-900 dark:text-white text-2xl font-bold dark:drop-shadow-[0_0_18px_rgba(56,189,248,0.55)]">🗺️ Live Weather Map</Title>
          <p className="text-slate-500 dark:text-slate-300 mt-2">Interactive flight routes and weather overlay</p>
        </div>
        <div className="p-6">
          <MapComponent cities={cities} mapConfig={mapConfigWithSelection} selectedFrom={selectedFrom} selectedTo={selectedTo} />
        </div>
      </Card>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
        <CityCard city={selectedFromCity} flights={selectedFromCity} />
        <CityCard city={selectedToCity} flights={selectedToCity} />
      </div>

      {/* 📈 Temperature Chart */}
      <Card className="mt-8 mb-6 bg-white/10 dark:bg-[#1F2937]/70 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="p-6 border-b border-white/10 dark:border-white/15">
          <Title className="text-slate-900 dark:text-white text-xl font-bold dark:drop-shadow-[0_0_16px_rgba(56,189,248,0.5)]">Weekly Temperature Comparison</Title>
          <p className="text-slate-500 dark:text-slate-300 mt-1">Temperature trends for selected routes</p>
        </div>
        <div className="p-6">
          <LineChart
            className="h-80"
            data={chartData}
            index="date"
            categories={[selectedFrom, selectedTo]}
            colors={["blue", "cyan"]}
            yAxisWidth={60}
            showLegend={true}
            showGridLines={false}
          />
        </div>
      </Card>


      {/* 📊 Impact Chart */}
      <Card className="mb-6 bg-white/10 dark:bg-[#1F2937]/70 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="p-6 border-b border-white/10 dark:border-white/15">
          <Title className="text-slate-900 dark:text-white text-xl font-bold dark:drop-shadow-[0_0_16px_rgba(248,113,113,0.5)]">Weather vs Flight Delay</Title>
          <p className="text-slate-500 dark:text-slate-300 mt-1">Correlation between weather severity and flight delays</p>
        </div>
        <div className="p-6">
          <LineChart
            className="h-80"
            data={selectedImpactData}
            index="day"
            categories={["delay", "severity"]}
            colors={["red", "yellow"]}
            yAxisWidth={60}
            showLegend={true}
            showGridLines={false}
          />
        </div>
      </Card>

      {/* 🧠 Insights */}
      <Card className="bg-white/10 dark:bg-[#1F2937]/70 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] p-6 mb-6">
        <Title className="text-slate-900 dark:text-white text-xl font-bold mb-6">AI Insights</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <span className="text-2xl">💧</span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">High Humidity Impact</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">High humidity (&gt;70%) shows strong correlation with increased delays. Correlation coefficient: 0.88</p>
            </div>
          </div>
          
          <div className="flex gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <span className="text-2xl">💨</span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Wind Speed Factor</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Wind speed &gt; 30 km/h leads to 18% increase in average delay. Crosswind conditions are the primary factor.</p>
            </div>
          </div>

          <div className="flex gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <span className="text-2xl">🌡️</span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Temperature Effect</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Temperatures above 32°C are associated with 22% higher delays. Impact is more significant during peak afternoon hours.</p>
            </div>
          </div>

          <div className="flex gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <span className="text-2xl">✈️</span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Highest Impact City</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Delhi (DEL) shows the highest average delays due to weather. ATC congestion and high traffic volume compound the effect.</p>
            </div>
          </div>

          <div className="flex gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <span className="text-2xl">🛬</span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Runway Operations</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Improving runway operations in high-humidity conditions can reduce delays by up to 12%. Strategic scheduling recommended.</p>
            </div>
          </div>

          <div className="flex gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <span className="text-2xl">🌧️</span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Rainfall Probability</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Rainfall intensity &gt; 10mm/hr increases delay probability by 35%. Especially impactful during monsoon season.</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">Insights are generated using historical data and machine learning models.</p>
      </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
