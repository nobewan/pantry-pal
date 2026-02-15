import { useState, useEffect } from "react";

function Cards() {
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/snowflake-data")

      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          // Only show the latest row
          const latest = data[data.length - 1];
          const formatted = [
            { name: "Temperature", value: latest.TEMP },
            { name: "Humidity", value: latest.HUMIDITY },
            { name: "Gas Level", value: latest.GAS },
            { name: "Pressure", value: latest.PRESSURE }
          ];
          setMetrics(formatted);
        }
      })
      .catch(err => console.error("Error fetching metrics:", err));
  }, []);

  return (
    <div className="flex justify-around h-full items-center">
      <div className="flex flex-col">
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

      <div className="bg-black m-10 h-[24rem] w-[36rem] rounded">
        <h1 className="text-white bg-slate-700 p-2">Camera</h1>
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
