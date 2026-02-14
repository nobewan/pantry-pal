function Cards() {

    return <div className='flex justify-around m-10 items-center'>
      <div className = "bg-white rounded-lg shadow-xl min-h-12.5 cursor-pointer p-4 box-content size-64">
        <h1 className = "text-slate-950 font-semibold text-center text-3xl">Temperature</h1>
    
      </div>
      <div className = "bg-white rounded-lg shadow-xl min-h-12.5 cursor-pointer p-4 box-content size-64">
      <h1 className = "text-slate-950 font-semibold text-center text-3xl">Humidity</h1>
      </div>
      <div className = "bg-white rounded-lg shadow-xl min-h-12.5 cursor-pointer p-4 box-content size-64">
      <h1 className = "text-slate-950 font-semibold text-center text-3xl">Gas Level</h1>
      </div>
    
    </div>
  
  }
  
  export default Cards