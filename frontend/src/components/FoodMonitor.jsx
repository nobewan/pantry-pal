import React, { useState, useEffect } from 'react';
import MyPlotComponent from "./MyPlotComponent.jsx";

function FoodMonitor() {
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/snowflake-data")

      .then(res => res.json())
      .then(rows => {
        // Map Snowflake rows to Plotly traces
        const graph = [
          {
            x: rows.map(row => row.TIME),
            y: rows.map(row => row.TEMP),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Temperature',
            marker: { color: 'red' }
          },
          {
            x: rows.map(row => row.TIME),
            y: rows.map(row => row.HUMIDITY),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Humidity',
            marker: { color: 'blue' }
          },
          {
            x: rows.map(row => row.TIME),
            y: rows.map(row => row.GAS),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Gas Level',
            marker: { color: 'green' }
          },
          {
            x: rows.map(row => row.TIME),
            y: rows.map(row => row.PRESSURE),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Pressure',
            marker: { color: 'orange' }
          }
        ];
        setGraphData(graph);
      })
      .catch(err => console.error("Error fetching Snowflake data:", err));
  }, []);

  const handleButtonClick = (shelf) => {
    if (graphData) {
      const filtered = graphData.map(d => ({ 
        ...d, 
        marker: { color: shelfColor(shelf) } 
      }));
      setGraphData(filtered);
    }
  };

  const shelfColor = (shelf) => {
    const colors = {
      "Shelf 1": "red",
      "Shelf 2": "blue",
      "Shelf 3": "green",
      "Shelf 4": "orange",
      "Shelf 5": "purple",
      "Shelf 6": "yellow"
    };
    return colors[shelf] || "gray";
  };

  return(
    <div className="flex h-full gap-x-3 justify-around">
      {/* Pantry Buttons */}
      <div className="bg-white m-2 shadow-xl flex-[0.7]">
        <h1 className="p-5 text-3xl font-bold">Pantry</h1>
        <div className="grid p-10 grid-cols-1 grid-rows-3 gap-x-5 gap-y-5 mb-10">
          {["Shelf 1","Shelf 2","Shelf 3","Shelf 4","Shelf 5","Shelf 6"].map((shelf, i) => (
            <button
              key={i}
              className="bg-gray-300 rounded-lg min-h-[3rem] cursor-pointer p-4 hover:bg-gray-400"
              onClick={() => handleButtonClick(shelf)}
            >
              <h1 className="text-slate-950 font-semibold text-center m-2">{shelf}</h1>
              <h2 className="text-slate-800 text-2xl">Food {i+1}</h2>
            </button>
          ))}
        </div>
      </div>

      {/* Analysis and Graph */}
      <div className="flex flex-col flex-1">
        <div className="bg-white m-2 shadow-xl flex flex-col">
          <h1 className="p-5 text-3xl font-bold">Analysis Results</h1>
          <div className="flex p-10 gap-5 m-3 justify-center items-center">
            <div className="bg-gray-300 rounded-lg min-h-[3rem] cursor-pointer p-4 mr-2">
              <h1 className="text-slate-950 font-semibold text-center">Average:</h1>
              <h1 className="text-slate-950 font-semibold text-center text-xl">2:00</h1>
            </div>
            <div className="bg-gray-300 rounded-lg min-h-[3rem] cursor-pointer p-4 ml-2">
              <h1 className="text-slate-950 font-semibold text-center">Exact</h1>
              <h1 className="text-slate-950 font-semibold text-center text-xl">2:34</h1>
            </div>
          </div>

          {/* Graph Section */}
          <div className="bg-white m-10 h-[500px]">
            <h1 className="justify-center text-center">Graph</h1>
            {graphData && <MyPlotComponent data={graphData} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodMonitor;
