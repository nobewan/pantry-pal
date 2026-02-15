import { useState, useEffect } from "react";

function Cards() {
  const [metrics, setMetrics] = useState([]);
  const [table, setTable] = useState("PANTRYPAL2"); // Default table

  useEffect(() => {
    fetch(`http://localhost:5000/api/snowflake-data?table=${table}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const latest = data[data.length - 1];
          const formatted = [
            { name: "Temperature", value: latest.TEMP },
            { name: "Humidity", value: latest.HUMIDITY },
            { name: "Gas Level", value: latest.GAS },
            { name: "Pressure", value: latest.PRESSURE }
          ];
          setMetrics(formatted);
        } else {
          setMetrics([]);
        }
      })
      .catch(err => console.error("Error fetching metrics:", err));
  }, [table]); // Re-fetch when table changes

  return (
    <div className="flex justify-around h-full items-start">
      {/* Metrics Section */}
      <div className="flex flex-col">
        {/* Table Selector */}
        <div className="mb-4">
          <label className="mr-2 font-semibold">Select Table:</label>
          <select
            className="border rounded p-1"
            value={table}
            onChange={(e) => setTable(e.target.value)}
          >
            {["PANTRYPAL2","GREENBANANA",,"RIPE","PANTRYPAL3"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Metrics Cards */}
        {metrics.length > 0 ? (
          metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-green-100 rounded-lg shadow-xl min-h-[3rem] cursor-pointer m-4 p-4 flex justify-between items-center"
            >
              <h1 className="text-slate-950 font-semibold text-center text-3xl">
                {metric.name}:
              </h1>
              <p>{metric.value}</p>
            </div>
          ))
        ) : (
          <div className="text-slate-700 p-4">Loading metrics...</div>
        )}
      </div>

      {/* Camera Section */}
      <div className="bg-black m-10 h-[24rem] w-[36rem] rounded flex flex-col">
        <h1 className="text-white bg-slate-700 p-2 text-center">Camera</h1>
        <img
          src=" "
          alt="Motion Detection Camera"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

export default Cards;
