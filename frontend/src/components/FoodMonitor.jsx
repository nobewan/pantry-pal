import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";

function FoodMonitor() {
  const [metricsData, setMetricsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [period, setPeriod] = useState("day");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedTable, setSelectedTable] = useState("GREENBANANA");

  const shelves = [
    { shelf: "Shelf 1", table: "GREENBANANA", label: "Green Banana" },
    { shelf: "Shelf 2", table: "RIPE", label: "Ripe Banana" },
    { shelf: "Shelf 3", table: "BANANA", label: "Regular Banana" },
    { shelf: "Shelf 4", table: null, label: null },
    { shelf: "Shelf 5", table: null, label: null },
    { shelf: "Shelf 6", table: null, label: null },
  ];

  const fetchData = () => {
    setLoading(true);
    setError(null);

    fetch(
      `http://localhost:5000/api/snowflake-data?table=${selectedTable}&date=${selectedDate}&period=${period}`
    )
      .then((res) => res.json())
      .then((rows) => {
        if (!Array.isArray(rows) || rows.length === 0) {
          setMetricsData([]);
          setLoading(false);
          return;
        }

        setMetricsData([
          {
            name: "Temperature (°C)",
            x: rows.map((r) => r.TIME),
            y: rows.map((r) => r.TEMP),
            color: "red",
            unit: "°C",
          },
          {
            name: "Humidity (%)",
            x: rows.map((r) => r.TIME),
            y: rows.map((r) => r.HUMIDITY),
            color: "blue",
            unit: "%",
          },
          {
            name: "Gas Level (Ω)",
            x: rows.map((r) => r.TIME),
            y: rows.map((r) => r.GAS),
            color: "green",
            unit: "Ω",
          },
          {
            name: "Pressure (hPa)",
            x: rows.map((r) => r.TIME),
            y: rows.map((r) => r.PRESSURE),
            color: "orange",
            unit: "hPa",
          },
        ]);

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch data from server");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [selectedTable, selectedDate, period]);

  // Combine all metrics into one Plotly graph
  const combinedGraphData = metricsData.map((metric) => ({
    x: metric.x,
    y: metric.y,
    type: "scatter",
    mode: "lines+markers",
    name: metric.name,
    line: { color: metric.color },
    marker: { color: metric.color },
    hovertemplate: `%{y} ${metric.unit} at %{x}<extra></extra>`,
  }));

  return (
    <div className="flex h-full gap-x-3 p-2 flex-wrap">
      {/* Pantry */}
      <div className="bg-white shadow-xl w-[250px] flex flex-col h-full overflow-auto">
        <h1 className="p-5 text-3xl font-bold">Pantry</h1>
        <div className="grid p-6 grid-cols-1 grid-rows-3 gap-5 flex-1">
          {shelves.map((item, i) => (
            <button
              key={i}
              onClick={() => item.table && setSelectedTable(item.table)}
              className={`bg-gray-300 rounded-lg min-h-[3rem] cursor-pointer p-4 hover:bg-gray-400 ${
                item.table === selectedTable ? "ring-2 ring-green-500" : ""
              }`}
            >
              <h1 className="text-slate-950 font-semibold text-center m-2">
                {item.shelf}
              </h1>
              <h2 className="text-slate-800 text-2xl">
                {item.label || `Food ${i + 1}`}
              </h2>
            </button>
          ))}
        </div>
      </div>

      {/* Analysis / Graph */}
      <div className="bg-white shadow-xl flex-1 flex flex-col h-full overflow-auto p-4 min-w-[500px]">
        <h1 className="p-2 text-3xl font-bold">Analysis Results</h1>

        {/* Period & Date Controls */}
        <div className="flex p-4 gap-5 justify-center items-center flex-wrap">
          <div className="bg-gray-300 rounded-lg min-h-[3rem] cursor-pointer p-4 flex flex-col items-center">
            <label className="text-slate-950 font-semibold">Period:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-2 p-1 rounded"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
          <div className="bg-gray-300 rounded-lg min-h-[3rem] cursor-pointer p-4 flex flex-col items-center">
            <label className="text-slate-950 font-semibold">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2 p-1 rounded"
            />
          </div>
        </div>

        {/* Combined Graph */}
        <div className="mt-4 h-[500px] w-full">
          {loading && <p className="text-center">Loading...</p>}
          {error && <p className="text-center text-red-600">{error}</p>}
          {!loading && !error && combinedGraphData.length > 0 && (
            <Plot
              data={combinedGraphData}
              layout={{
                title: "Food Metrics",
                xaxis: { title: "Time", tickangle: -45, automargin: true },
                yaxis: { title: "Value", automargin: true },
                margin: { t: 50, b: 50, l: 50, r: 50 },
                autosize: true,
                legend: { orientation: "h", x: 0, y: 1.1 },
              }}
              style={{ width: "100%", height: "100%" }}
              useResizeHandler={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodMonitor;
