import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";

function FoodMonitor() {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for period and date
  const [period, setPeriod] = useState("day"); // day, week, month
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  ); // YYYY-MM-DD

  // Fetch Snowflake data
  useEffect(() => {
    setLoading(true);
    setError("");

    fetch("http://localhost:5000/api/snowflake-data?table=GREENBANANA")
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((rows) => {
        if (!Array.isArray(rows)) throw new Error("Invalid data format");

        // Build graph
        const graph = [
          {
            x: rows.map((row) => row.TIME),
            y: rows.map((row) => row.TEMP),
            type: "scatter",
            mode: "lines+markers",
            name: "Temperature",
            line: { color: "red" },
          },
          {
            x: rows.map((row) => row.TIME),
            y: rows.map((row) => row.HUMIDITY),
            type: "scatter",
            mode: "lines+markers",
            name: "Humidity",
            line: { color: "blue" },
          },
          {
            x: rows.map((row) => row.TIME),
            y: rows.map((row) => row.GAS),
            type: "scatter",
            mode: "lines+markers",
            name: "Gas Level",
            line: { color: "green" },
          },
          {
            x: rows.map((row) => row.TIME),
            y: rows.map((row) => row.PRESSURE),
            type: "scatter",
            mode: "lines+markers",
            name: "Pressure",
            line: { color: "orange" },
          },
        ];

        setGraphData(graph);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching Snowflake data:", err);
        setError("Failed to load data");
        setLoading(false);
      });
  }, [period, selectedDate]); // Could filter later by period/date

  // Change shelf colors
  const handleButtonClick = (shelf) => {
    if (graphData) {
      const color = shelfColor(shelf);
      const updated = graphData.map((d) => ({
        ...d,
        line: { ...d.line, color },
      }));
      setGraphData(updated);
    }
  };

  const shelfColor = (shelf) => {
    const colors = {
      "Shelf 1": "red",
      "Shelf 2": "blue",
      "Shelf 3": "green",
      "Shelf 4": "orange",
      "Shelf 5": "purple",
      "Shelf 6": "yellow",
    };
    return colors[shelf] || "gray";
  };

  return (
    <div className="flex h-full gap-x-3 justify-around flex-wrap">
      {/* Pantry Buttons */}
      <div className="bg-white m-2 shadow-xl flex-[0.7] min-w-[250px]">
        <h1 className="p-5 text-3xl font-bold">Pantry</h1>
        <div className="grid p-10 grid-cols-1 grid-rows-3 gap-5 mb-10">
          {["Shelf 1","Shelf 2","Shelf 3","Shelf 4","Shelf 5","Shelf 6"].map(
            (shelf, i) => (
              <button
                key={i}
                className="bg-gray-300 rounded-lg min-h-[3rem] cursor-pointer p-4 hover:bg-gray-400"
                onClick={() => handleButtonClick(shelf)}
              >
                <h1 className="text-slate-950 font-semibold text-center m-2">
                  {shelf}
                </h1>
                <h2 className="text-slate-800 text-2xl">Food {i + 1}</h2>
              </button>
            )
          )}
        </div>
      </div>

      {/* Analysis and Graph */}
      <div className="flex flex-col flex-1 min-w-[500px]">
        <div className="bg-white m-2 shadow-xl flex flex-col">
          <h1 className="p-5 text-3xl font-bold">Analysis Results</h1>

          {/* Period & Date Controls */}
          <div className="flex p-10 gap-5 m-3 justify-center items-center flex-wrap">
            {/* Period */}
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

            {/* Date */}
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

          {/* Graph */}
          <div className="bg-white m-10 h-[500px] w-full">
            <h1 className="justify-center text-center mb-2">Graph</h1>
            {loading && <p className="text-center text-gray-700">Loading graph...</p>}
            {error && <p className="text-center text-red-600 font-semibold">{error}</p>}
            {graphData && <Plot data={graphData} layout={{ autosize: true }} style={{ width: "100%", height: "100%" }} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodMonitor;
