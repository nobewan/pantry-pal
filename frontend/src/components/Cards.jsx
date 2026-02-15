import { useState, useEffect } from "react";

function Cards() {
  const [metrics, setMetrics] = useState([]);
  const [table, setTable] = useState("GREENBANANA");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`http://localhost:5000/api/snowflake-data?table=${table}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) {
          setMetrics([]);
          setLoading(false);
          return;
        }

        const latest = data[data.length - 1];

        const formatted = [
          { name: "Temperature", value: latest.TEMP ?? "N/A" },
          { name: "Humidity", value: latest.HUMIDITY ?? "N/A" },
          { name: "Gas Level", value: latest.GAS ?? "N/A" },
          { name: "Pressure", value: latest.PRESSURE ?? "N/A" },
        ];

        setMetrics(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching metrics:", err);
        setError("Failed to load data");
        setLoading(false);
      });
  }, [table]);

  return (
    <div className="flex justify-around flex-wrap gap-6 p-6">

      {/* Metrics Section */}
      <div className="flex flex-col">

        {/* Table Selector */}
        <div className="mb-4">
          <label className="mr-2 font-semibold">Select Table:</label>
          <select
            className="border rounded p-2 shadow"
            value={table}
            onChange={(e) => setTable(e.target.value)}
          >
            {["GREENBANANA", "BANANA", "RIPE"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-slate-700 p-4 animate-pulse">
            Loading metrics...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-red-600 p-4 font-semibold">
            {error}
          </div>
        )}

        {/* Metrics Cards */}
        {!loading && !error && metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-green-100 rounded-xl shadow-xl m-3 p-4 flex justify-between items-center min-w-[250px]"
          >
            <h1 className="text-slate-900 font-semibold text-xl">
              {metric.name}
            </h1>
            <p className="text-lg font-bold">{metric.value}</p>
          </div>
        ))}

      </div>

      {/* Camera Section */}
      <div className="bg-black h-[24rem] w-[36rem] rounded-xl overflow-hidden shadow-lg">
        <h1 className="text-white bg-slate-700 p-2 text-center font-semibold">
          Camera
        </h1>

        {/* Replace src with your camera stream URL */}
        <img
          src=""
          alt="Motion Detection Camera"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/640x480?text=Camera+Offline";
          }}
        />
      </div>

    </div>
  );
}

export default Cards;