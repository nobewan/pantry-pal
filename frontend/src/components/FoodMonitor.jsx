import MyPlotComponent from "./MyPlotComponent.jsx";
import React, { useState } from 'react';
function FoodMonitor() {
  const [graphData, setGraphData] = useState(null); 

  const buttonGraphData = {
    'Shelf 1': { x: [1, 2, 3], y: [2, 6, 3], type: 'scatter', mode: 'lines+markers', marker: { color: 'red' } },
    'Shelf 2': { x: [1, 2, 3], y: [3, 5, 1], type: 'scatter', mode: 'lines+markers', marker: { color: 'blue' } },
    'Shelf 3': { x: [1, 2, 3], y: [1, 4, 2], type: 'scatter', mode: 'lines+markers', marker: { color: 'green' } },
    'Shelf 4': { x: [1, 2, 3], y: [5, 2, 4], type: 'scatter', mode: 'lines+markers', marker: { color: 'orange' } },
    'Shelf 5': { x: [1, 2, 3], y: [4, 1, 5], type: 'scatter', mode: 'lines+markers', marker: { color: 'purple' } },
    'Shelf 6': { x: [1, 2, 3], y: [2, 3, 4], type: 'scatter', mode: 'lines+markers', marker: { color: 'yellow' } }
  };

  const handleButtonClick = (shelf) => {
    setGraphData([buttonGraphData[shelf]]);
  };
    
  return(
    <div className="flex h-full gap-x-3 justify-around">
      {/* Food Monitor Section */}
      <div className="bg-white m-2 shadow-xl flex-[0.7] ">
        <h1 className="p-5 text-3xl font-bold ">Pantry</h1>
        <div className="grid p-10 grid-cols-1 grid-rows-3 gap-x-5 gap-y-5 mb-10">
          <button className ="bg-gray-300 rounded-lg h-8/5min-h-12.5 cursor-pointer p-4 hover:bg-gray-400" onClick={() => handleButtonClick('Shelf 1')}>
            <h1 className="text-slate-950 font-semibold text-center- m-2">Shelf 1</h1>
            <h2 className="text-slate-800 text-2xl">Food 1</h2>
          </button>
          <button className ="bg-gray-300 rounded-lg min-h-12.5 cursor-pointer p-4  hover:bg-gray-400"  onClick={() => handleButtonClick('Shelf 2')}>
            <h1 className="text-slate-950 font-semibold text-center m-2">Shelf 2</h1>
            <h2 className="text-slate-800 text-2xl">Food 2</h2>
          </button>
          <button className ="bg-gray-300 rounded-lg min-h-12.5 cursor-pointer p-4  hover:bg-gray-400"  onClick={() => handleButtonClick('Shelf 3')}>
            <h1 className="text-slate-950 font-semibold text-center m-2">Shelf 3</h1>
            <h2 className="text-slate-800 text-2xl">Food 1</h2>
          </button>
          <button className ="bg-gray-300 rounded-lg min-h-12.5 cursor-pointer p-4  hover:bg-gray-400"  onClick={() => handleButtonClick('Shelf 4')}>
            <h1 className="text-slate-950 font-semibold text-center m-2">Shelf 4</h1>
            <h2 className="text-slate-800 text-2xl">Food 1</h2>
          </button>
          <button className ="bg-gray-300 rounded-lg min-h-12.5 cursor-pointer p-4  hover:bg-gray-400"  onClick={() => handleButtonClick('Shelf 5')}>
            <h1 className="text-slate-950 font-semibold text-center m-2">Shelf 5</h1>
            <h2 className="text-slate-800 text-2xl">Food 1</h2>
          </button>
          <button className ="bg-gray-300 rounded-lg min-h-12.5 cursor-pointer p-4  hover:bg-gray-400"  onClick={() => handleButtonClick('Shelf 6')}>
            <h1 className="text-slate-950 font-semibold text-center m-2 ">Shelf 6</h1>
            <h2 className="text-slate-800 text-2xl">Food 1</h2>
          </button>
      
        </div>
      </div>
      <div className="flex flex-col">
        {/* Analysis Section */}
        <div className="bg-white m-2 shadow-xl flex-1 flex flex-col ">
          <h1 className="p-5 text-3xl font-bold">Analysis Results</h1>
            <div className="flex p-10 gap-5 m-3 justify-center items-center">
              <div className="bg-gray-300 rounded-lg min-h-12.5 cursor-pointer p-4 mr-2">
                <h1 className="text-slate-950 font-semibold text-center">Average:</h1>
                <h1 className="text-slate-950 font-semibold text-center text-xl">2:00</h1>
              </div>
              <div className="bg-gray-300 rounded-lg min-h-12.5 cursor-pointer p-4 ml-2">
                <h1 className="text-slate-950 font-semibold text-center">Exact</h1>
                <h1 className="text-slate-950 font-semibold text-center text-xl">2:34</h1>
              </div>
            </div>
          {/* Graph Section */}
          
          <div className="bg-white m-10 h-100 ">
          <h1 className = "justify-center text-center">Graph</h1>
           {graphData && <MyPlotComponent data={graphData} />}
         {/*<img src="" alt="Graph" className="w-full h-full object-cover" />*/}
          </div>
        </div>
        </div>
      </div>
        

  

)

  
  }
  
  export default FoodMonitor