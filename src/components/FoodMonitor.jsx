function FoodMonitor() {

    
  return(
    <div className="flex justify-around h-full">
      {/* Food Monitor Section */}
      <div className="bg-white m-10 shadow-xl flex-1">
        <h1 className="p-10 text-3xl font-bold">Pantry</h1>
        <div className="grid p-10 grid-cols-11grid-rows-3 gap-x-5 gap-y-5 mb-10">
          <div className="bg-gray-300 rounded-lg min-h-12.5 cursor-pointer p-4">
            <h1 className="text-slate-950 font-semibold text-center text-3xl">
              Food1
            </h1>


          </div>
          <div className="bg-gray-300 rounded-lg min-h-12.5 cursor-pointer p-4">
            <h1 className="text-slate-950 font-semibold text-center text-3xl">
              Food2
            </h1>
          </div>
          <div className="bg-gray-300 rounded-lg min-h-12.5 cursor-pointer p-4">
            <h1 className="text-slate-950 font-semibold text-center text-3xl">
              Food3
            </h1>
          </div>
          <div className="bg-gray-300 rounded-lg min-h-12.5 cursor-pointer p-4">
            <h1 className="text-slate-950 font-semibold text-center text-3xl">
              Food4
            </h1>
          </div>
          <div className="bg-gray-300 rounded-lg min-h-12.5 cursor-pointer p-4">
            <h1 className="text-slate-950 font-semibold text-center text-3xl">
              Food5
            </h1>
            </div>
          <div className="bg-gray-300 rounded-lg min-h-12.5 cursor-pointer p-4">
            <h1 className="text-slate-950 font-semibold text-center text-3xl">Food6</h1>
          </div>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="bg-white m-10 shadow-xl flex-1 flex flex-col">
           <h1 className="p-10 font-bold">Analysis Results</h1>
          <div className = "flex p-10 gap-5 mb-10 justify-center items-center">
          <div className = "bg-gray-300  rounded-lg  min-h-12.5 cursor-pointer p-4">
            <h1 className = "text-slate-950 font-semibold text-center text-3xl">Avg Time</h1>
            </div>
            <div className = "bg-gray-300  rounded-lg  min-h-12.5 cursor-pointer p-4">
            <h1 className = "text-slate-950 font-semibold text-center text-3xl">Exact Time</h1>
          </div>
          </div>
        <h1 className="p-10 font-bold">Graphs</h1>
        <div className="bg-black m-10 h-100">
           <img
            src="http://localhost:5000/video"
            alt="Motion Detection Camera"
            className="w-full h-full object-cover"
          />
        </div>
        
      </div>
    </div>
)

  
  }
  
  export default FoodMonitor