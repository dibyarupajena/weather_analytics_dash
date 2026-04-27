// import { Card, Metric, Text, Title, DonutChart, LineChart } from "@tremor/react";
// import './App.css'

// // 🌤️ Weather Data
// const city1 = {
//   name: "Bangalore",
//   temperature: 29,
//   humidity: 65,
//   airQuality: 7.5,
//   daily: [
//     { date: "Mon", temp: 28 },
//     { date: "Tue", temp: 30 },
//     { date: "Wed", temp: 27 },
//     { date: "Thu", temp: 29 },
//     { date: "Fri", temp: 31 },
//   ]
// };

// const city2 = {
//   name: "Delhi",
//   temperature: 34,
//   humidity: 55,
//   airQuality: 6.2,
//   daily: [
//     { date: "Mon", temp: 33 },
//     { date: "Tue", temp: 35 },
//     { date: "Wed", temp: 36 },
//     { date: "Thu", temp: 34 },
//     { date: "Fri", temp: 37 },
//   ]
// };

// // ✈️ Flight Data
// const flightData = {
//   Bangalore: {
//     totalFlights: 120,
//     delayedFlights: 35,
//     avgDelay: 28
//   },
//   Delhi: {
//     totalFlights: 150,
//     delayedFlights: 60,
//     avgDelay: 42
//   }
// };

// // 📊 Merge for comparison chart
// const chartData = city1.daily.map(({ date, temp }) => {
//   const other = city2.daily.find(d => d.date === date);
//   return {
//     date,
//     Bangalore: temp,
//     Delhi: other?.temp
//   };
// });

// // ⚡ Severity Calculation
// const getSeverity = (city) => {
//   return (
//     city.humidity * 0.3 +
//     city.temperature * 0.2 +
//     city.airQuality * 5
//   ).toFixed(1);
// };

// // 📈 Impact Data
// const impactData = [
//   { day: "Mon", delay: 20, severity: 6 },
//   { day: "Tue", delay: 35, severity: 8 },
//   { day: "Wed", delay: 25, severity: 5 },
//   { day: "Thu", delay: 40, severity: 9 },
//   { day: "Fri", delay: 30, severity: 7 },
// ];

// // 🧩 Reusable City Component
// const CityCard = ({ city, flights }) => {
//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-6">{city.name}</h2>

//       <Card className="max-w-lg mb-6">
//         <Title>Air Quality</Title>
//         <DonutChart
//           className="mt-6 mb-6"
//           data={[
//             { name: "Good", value: city.airQuality },
//             { name: "Bad", value: 10 - city.airQuality }
//           ]}
//           category="value"
//           index="name"
//           colors={["green", "red"]}
//           label={`${(city.airQuality * 10).toFixed()}%`}
//         />
//       </Card>

//       <Card className="max-w-xs mx-auto mb-6">
//         <Text>Temperature</Text>
//         <Metric>{city.temperature}°C</Metric>
//       </Card>

//       <Card className="max-w-xs mx-auto mb-6">
//         <Text>Humidity</Text>
//         <Metric>{city.humidity}%</Metric>
//       </Card>

//       <Card className="max-w-xs mx-auto mb-6">
//         <Text>Flights Delayed</Text>
//         <Metric>{flights.delayedFlights}</Metric>
//       </Card>

//       <Card className="max-w-xs mx-auto mb-6">
//         <Text>Avg Delay</Text>
//         <Metric>{flights.avgDelay} min</Metric>
//       </Card>

//       <Card className="max-w-xs mx-auto mb-6">
//         <Text>Weather Severity</Text>
//         <Metric>{getSeverity(city)}</Metric>
//       </Card>
//     </div>
//   );
// };

// function App() {

//   // 📊 KPI Calculations
//   const totalFlights =
//     flightData.Bangalore.totalFlights + flightData.Delhi.totalFlights;

//   const totalDelays =
//     flightData.Bangalore.delayedFlights + flightData.Delhi.delayedFlights;

//   const delayRate = ((totalDelays / totalFlights) * 100).toFixed(1);

//   // 🔥 Worst City Logic
//   const worstCity =
//     getSeverity(city1) > getSeverity(city2) ? city1.name : city2.name;

//   // 🧠 Insight Logic
//   const insight =
//     worstCity === "Delhi"
//       ? "Delhi shows higher delays due to poor air quality and higher temperature."
//       : "Bangalore is currently more impacted due to weather instability.";

//   return (
//     <div className="text-left p-6 bg-gray-100 min-h-screen">

//       {/* 📊 KPI Section */}
//       <div className="grid grid-cols-4 gap-6 mb-8">
//         <Card>
//           <Text>Total Flights</Text>
//           <Metric>{totalFlights}</Metric>
//         </Card>

//         <Card>
//           <Text>Total Delays</Text>
//           <Metric>{totalDelays}</Metric>
//         </Card>

//         <Card>
//           <Text>Delay Rate</Text>
//           <Metric>{delayRate}%</Metric>
//         </Card>

//         <Card>
//           <Text>Worst City</Text>
//           <Metric>{worstCity}</Metric>
//         </Card>
//       </div>

//       {/* 🌆 Cities */}
//       <div className="grid grid-cols-2 gap-12">
//         <CityCard city={city1} flights={flightData.Bangalore} />
//         <CityCard city={city2} flights={flightData.Delhi} />
//       </div>

//       {/* 📈 Temperature Chart */}
//       <Card className="mt-8">
//         <Title>Weekly Temperature Comparison</Title>
//         <LineChart
//           className="mt-6"
//           data={chartData}
//           index="date"
//           categories={["Bangalore", "Delhi"]}
//           colors={["blue", "red"]}
//           yAxisWidth={50}
//         />
//       </Card>

//       {/* 📊 Impact Chart */}
//       <Card className="mt-8">
//         <Title>Weather vs Flight Delay</Title>
//         <LineChart
//           className="mt-6"
//           data={impactData}
//           index="day"
//           categories={["delay", "severity"]}
//           colors={["red", "blue"]}
//         />
//       </Card>

//       {/* 🧠 Insights */}
//       <Card className="mt-8 bg-blue-50">
//         <Title>Insights</Title>
//         <Text className="mt-4">{insight}</Text>
//       </Card>

//     </div>
//   );
// }

// export default App;


import { useEffect, useMemo, useState } from "react";
import { Card, Metric, Text, Title, LineChart, DonutChart } from "@tremor/react";

// ⚡ Severity Calculation
const getSeverity = (city) => {
  return (
    city.humidity * 0.3 +
    city.temperature * 0.2 +
    city.airQuality * 5
  ).toFixed(1);
};

// 🧩 Reusable City Component
const CityCard = ({ city, flights }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{city.name}</h2>

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
  const [city1, setCity1] = useState(null);
  const [city2, setCity2] = useState(null);

  const fetchData = async () => {
    const res = await fetch("/data.json"); // 👈 acts like API
    const json = await res.json();

    setCity1({
      name: "Bangalore",
      temperature: json.Bangalore.temperature,
      humidity: json.Bangalore.humidity,
      airQuality: json.Bangalore.airQuality,
      daily: json.Bangalore.daily,
      totalFlights: json.Bangalore.totalFlights,
      delayedFlights: json.Bangalore.delayedFlights,
      avgDelay: json.Bangalore.avgDelay
    });

    setCity2({
      name: "Delhi",
      temperature: json.Delhi.temperature,
      humidity: json.Delhi.humidity,
      airQuality: json.Delhi.airQuality,
      daily: json.Delhi.daily,
      totalFlights: json.Delhi.totalFlights,
      delayedFlights: json.Delhi.delayedFlights,
      avgDelay: json.Delhi.avgDelay
    });


  };

  useEffect(() => {
    fetchData(); // first load

    const interval = setInterval(() => {
      fetchData(); // refresh every 10 mins
    }, 600000);

    return () => clearInterval(interval);
  }, []);

  const chartData = useMemo(() => {
    if (!city1 || !city2) return [];

    return city1.daily.map(({ date, temp }) => {
      const other = city2.daily.find(d => d.date === date);
      return {
        date,
        Bangalore: temp,
        Delhi: other?.temp
      };
    });
  }, [city1, city2]);

  if (!city1 || !city2) {
    return <div className="p-6">Loading...</div>;
  }

  // 📊 KPI Calculations (moved after loading check)
  const totalFlights = city1.totalFlights + city2.totalFlights;
  const totalDelays = city1.delayedFlights + city2.delayedFlights;
  const delayRate = ((totalDelays / totalFlights) * 100).toFixed(1);

  // 🔥 Worst City Logic
  const worstCity = getSeverity(city1) > getSeverity(city2) ? city1.name : city2.name;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* 📊 KPI Section */}
      <div className="grid grid-cols-4 gap-6 mb-8">
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

      <div className="grid grid-cols-2 gap-12">

        <CityCard city={city1} flights={city1} />
        <CityCard city={city2} flights={city2} />

      </div>

      {/* 📈 Temperature Chart */}
      <Card className="mt-8">
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
    </div>
  );
}

export default App;