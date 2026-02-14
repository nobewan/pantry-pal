function Cards() {


  return (
  <div className='flex justify-around h-full items-center'>
    
     {/* Dashboard */}
    <div className="flex flex-col">
      <div className="bg-green-100 rounded-lg shadow-xl min-h-12.5 cursor-pointer m-4 p-4 flex justify-between items-center">
        <h1 className="text-slate-950 font-semibold text-center text-3xl">Temp:</h1>
        <p>Very hot</p>
      </div>
      <div className="bg-green-100 rounded-lg shadow-xl min-h-12.5 cursor-pointer m-4 p-4 flex justify-between items-center">
        <h1 className="text-slate-950 font-semibold text-center text-3xl">Humidity:</h1>
        <p>Very hot</p>
      </div>
      <div className="bg-green-100 rounded-lg shadow-xl min-h-12.5 cursor-pointer m-4 p-4 flex justify-between items-center">
        <h1 className="text-slate-950 font-semibold text-center text-3xl">Gas Level:</h1>
        <p>Very hot</p>
      </div>
    </div>

    {/* Camera Section */}
    <div className="bg-black m-10 h-100  w-150 rounded">
      <h1 className="text-white bg-slate-700 p-2">Camera</h1>
      <img
            src=" "
            alt="Motion Detection Camera"
            className="w-full h-full object-cover"
          />
    </div>

</div>
  )

}

export default Cards