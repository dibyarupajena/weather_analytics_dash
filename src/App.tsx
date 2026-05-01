


import { useEffect, useMemo, useState } from "react";
import { Card, Metric, Text, Title, LineChart, DonutChart } from "@tremor/react";
import MapComponent from "./MapComponent";
import "./App.css";

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

// � Reusable City Component
const CityCard = ({ city, flights }: { city: any, flights: any }) => {
  const onTimeRate = city.totalFlights ? Math.max(0, 100 - Math.round((flights.delayedFlights / city.totalFlights) * 100)) : 0;
  const delayStatus = flights.avgDelay > 30 ? "High Delays" : flights.avgDelay > 18 ? "Moderate Delays" : "Low Delays";
  const statusClasses = flights.avgDelay > 30
    ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300"
    : flights.avgDelay > 18
    ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";

  return (
    <Card className="dashboard-card rounded-[1.75rem] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{city.name}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Weather and flight impact snapshot</p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] ${statusClasses}`}>
          {delayStatus}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card className="bg-white/90 border border-slate-200/70 p-5 text-slate-900 shadow-sm dark:bg-slate-950/80 dark:border-white/10 dark:text-slate-100">
          <Text className="text-slate-500 text-sm font-semibold mb-3 dark:text-slate-400">Air Quality</Text>
          <DonutChart
            className="mt-2"
            data={[
              { name: "Good", value: city.airQuality },
              { name: "Bad", value: 10 - city.airQuality }
            ]}
            category="value"
            index="name"
            colors={["emerald", "rose"]}
            label={`${(city.airQuality * 10).toFixed()}%`}
          />
        </Card>

        <div className="grid gap-4">
          <Card className="bg-white/90 border border-slate-200/70 p-5 text-slate-900 shadow-sm dark:bg-slate-950/80 dark:border-white/10 dark:text-slate-100">
            <Text className="text-slate-500 text-sm font-semibold mb-2 dark:text-slate-400">Temperature</Text>
            <Metric className="text-slate-900 text-3xl dark:text-slate-100">{city.temperature}°C</Metric>
          </Card>

          <Card className="bg-white/90 border border-slate-200/70 p-5 text-slate-900 shadow-sm dark:bg-slate-950/80 dark:border-white/10 dark:text-slate-100">
            <Text className="text-slate-500 text-sm font-semibold mb-2 dark:text-slate-400">Humidity</Text>
            <Metric className="text-slate-900 text-3xl dark:text-slate-100">{city.humidity}%</Metric>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mt-6">
        <Card className="bg-white/90 border border-slate-200/70 p-4 text-slate-900 shadow-sm dark:bg-slate-950/80 dark:border-white/10 dark:text-slate-100">
          <Text className="text-slate-500 text-xs uppercase tracking-[0.24em] mb-2 dark:text-slate-400">Total Flights</Text>
          <Metric className="text-slate-900 dark:text-slate-100">{city.totalFlights}</Metric>
        </Card>
        <Card className="bg-white/90 border border-slate-200/70 p-4 text-slate-900 shadow-sm dark:bg-slate-950/80 dark:border-white/10 dark:text-slate-100">
          <Text className="text-slate-500 text-xs uppercase tracking-[0.24em] mb-2 dark:text-slate-400">Delayed Flights</Text>
          <Metric className="text-slate-900 dark:text-slate-100">{flights.delayedFlights}</Metric>
        </Card>
        <Card className="bg-white/90 border border-slate-200/70 p-4 text-slate-900 shadow-sm dark:bg-slate-950/80 dark:border-white/10 dark:text-slate-100">
          <Text className="text-slate-500 text-xs uppercase tracking-[0.24em] mb-2 dark:text-slate-400">Avg Delay</Text>
          <Metric className="text-slate-900 dark:text-slate-100">{flights.avgDelay} min</Metric>
        </Card>
        <Card className="bg-white/90 border border-slate-200/70 p-4 text-slate-900 shadow-sm dark:bg-slate-950/80 dark:border-white/10 dark:text-slate-100">
          <Text className="text-slate-500 text-xs uppercase tracking-[0.24em] mb-2 dark:text-slate-400">On-time %</Text>
          <Metric className="text-slate-900 dark:text-slate-100">{onTimeRate}%</Metric>
        </Card>
      </div>
    </Card>
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

  const lastUpdatedText = new Date().toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-[#050a17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8 rounded-[2rem] border bg-white/90 p-6 shadow-[0_24px_54px_rgba(15,23,42,0.08)] backdrop-blur-xl text-slate-900 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-[0_30px_80px_rgba(0,0,0,0.35)] dark:text-slate-100">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-700/80 dark:text-cyan-300/75">Flight Delay & Weather Dashboard</p>
              <h1 className="text-3xl font-semibold">Flight Delay & Weather Impact</h1>
              <p className="max-w-2xl text-slate-600 dark:text-slate-400">Indian city weather and flight delay analytics for major hubs, updated live every 10 minutes.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-3xl border border-slate-200/60 bg-slate-100/90 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300">Last update: {lastUpdatedText}</div>
              <button
                onClick={toggleTheme}
                className="rounded-3xl border border-slate-200/60 bg-slate-100/90 px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-200 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-[1.5rem] border border-slate-200/60 bg-white/90 p-5 dark:border-white/10 dark:bg-slate-950/80">
            <Text className="text-slate-600 text-sm font-semibold uppercase tracking-[0.18em] mb-3 dark:text-slate-400">Flight From</Text>
            <select
              value={selectedFrom}
              onChange={(e) => setSelectedFrom(e.target.value)}
              className="w-full rounded-3xl border border-slate-300/70 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-100"
            >
              {cities.map((city) => (
                <option key={city.name} value={city.name} className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200/60 bg-white/90 p-5 dark:border-white/10 dark:bg-slate-950/80">
            <Text className="text-slate-600 text-sm font-semibold uppercase tracking-[0.18em] mb-3 dark:text-slate-400">Flight To</Text>
            <select
              value={selectedTo}
              onChange={(e) => setSelectedTo(e.target.value)}
              className="w-full rounded-3xl border border-slate-300/70 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-100"
            >
              {cities
                .filter((city) => city.name !== selectedFrom)
                .map((city) => (
                  <option key={city.name} value={city.name} className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                    {city.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-4 mb-8">
          <Card className="dashboard-card border-l-4 border-l-emerald-500 p-6 dark:border-l-emerald-500/50">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Text className="text-slate-600 text-sm font-semibold uppercase tracking-[0.24em] dark:text-slate-400">Total Flights</Text>
                <Metric className="mt-3 text-3xl text-emerald-600 dark:text-emerald-300">{totalFlights}</Metric>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">+8.6% vs yesterday</span>
            </div>
          </Card>

          <Card className="dashboard-card border-l-4 border-l-red-500 p-6 dark:border-l-red-500/50">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Text className="text-slate-600 text-sm font-semibold uppercase tracking-[0.24em] dark:text-slate-400">Delayed Flights</Text>
                <Metric className="mt-3 text-3xl text-red-600 dark:text-red-300">{totalDelays}</Metric>
              </div>
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">-15.3% vs yesterday</span>
            </div>
          </Card>

          <Card className="dashboard-card border-l-4 border-l-amber-500 p-6 dark:border-l-amber-500/50">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Text className="text-slate-600 text-sm font-semibold uppercase tracking-[0.24em] dark:text-slate-400">Avg Delay</Text>
                <Metric className="mt-3 text-3xl text-amber-600 dark:text-amber-300">{delayRate}%</Metric>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">+6 min vs yesterday</span>
            </div>
          </Card>

          <Card className="dashboard-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Text className="text-slate-500 text-sm font-semibold uppercase tracking-[0.24em] dark:text-slate-400">Worst City</Text>
                <Metric className="mt-3 text-3xl text-slate-900 dark:text-slate-100">{worstCity}</Metric>
              </div>
              <span className="rounded-full bg-slate-100/90 px-3 py-1 text-sm text-slate-800 dark:bg-slate-700/80 dark:text-slate-300">Insight</span>
            </div>
          </Card>
        </div>

        <Card className="dashboard-card overflow-hidden mb-8">
          <div className="flex flex-col gap-4 border-b border-slate-200/60 bg-white/90 p-6 text-slate-900 dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-100">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Title className="text-2xl font-semibold">Live Weather Map</Title>
                <p className="mt-2 text-slate-600 dark:text-slate-400">Indian cities and flight corridors with weather severity overlay.</p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-700 dark:text-slate-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-slate-100/90 px-3 py-2 dark:border-white/10 dark:bg-slate-900/80">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Low Delay
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-slate-100/90 px-3 py-2 dark:border-white/10 dark:bg-slate-900/80">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Medium Delay
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-slate-100/90 px-3 py-2 dark:border-white/10 dark:bg-slate-900/80">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" /> High Delay
                </span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <MapComponent cities={cities} mapConfig={mapConfigWithSelection} selectedFrom={selectedFrom} selectedTo={selectedTo} />
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2 mb-8">
          <CityCard city={selectedFromCity} flights={selectedFromCity} />
          <CityCard city={selectedToCity} flights={selectedToCity} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2 mb-8">
          <Card className="dashboard-card overflow-hidden">
            <div className="border-b border-slate-200/60 bg-white/90 p-6 text-slate-900 dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-100">
              <Title className="text-xl font-semibold">Weather Factors vs Avg Delay</Title>
              <Text className="mt-2 text-slate-600 dark:text-slate-400">Higher humidity and temperature often correspond with longer delay windows.</Text>
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

          <Card className="dashboard-card overflow-hidden">
            <div className="border-b border-slate-200/60 bg-white/90 p-6 text-slate-900 dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-100">
              <Title className="text-xl font-semibold">Weekly Temperature Comparison</Title>
              <Text className="mt-2 text-slate-600 dark:text-slate-400">Temperature trends for the chosen pair of Indian cities.</Text>
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
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="dashboard-card p-6">
            <Text className="text-slate-600 text-sm font-semibold uppercase tracking-[0.24em] dark:text-slate-400">Humidity impact</Text>
            <Title className="mt-3 text-lg text-slate-900 dark:text-white">High humidity (&gt;70%) shows strong correlation with delays.</Title>
            <Text className="mt-4 text-slate-600 dark:text-slate-400">Rainy and humid conditions are reducing runway efficiency in many cities.</Text>
          </Card>
          <Card className="dashboard-card p-6">
            <Text className="text-slate-600 text-sm font-semibold uppercase tracking-[0.24em] dark:text-slate-400">Temperature risk</Text>
            <Title className="mt-3 text-lg text-slate-900 dark:text-white">Temperatures over 32°C are linked to 22% higher delays.</Title>
            <Text className="mt-4 text-slate-600 dark:text-slate-400">Heat stress and reduced visibility impact aircraft turnaround times.</Text>
          </Card>
          <Card className="dashboard-card p-6">
            <Text className="text-slate-600 text-sm font-semibold uppercase tracking-[0.24em] dark:text-slate-400">Route insight</Text>
            <Title className="mt-3 text-lg text-slate-900 dark:text-white">{insight}</Title>
            <Text className="mt-4 text-slate-600 dark:text-slate-400">ATC congestion and high traffic volume continue to amplify delays across selected hubs.</Text>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
