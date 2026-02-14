import React from 'react';
import Plot from 'react-plotly.js';

function MyPlotComponent({ data = [] }) {
  return (
    <Plot

      data={data}
      layout={{ width: 500, height: 500, title: 'Shelf Data' }}

      useResizeHandler={true}
      style={{width: '100%', height: '100%'}}
      
    />
  );
}

export default MyPlotComponent;
