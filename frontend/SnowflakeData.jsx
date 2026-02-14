// src/components/SnowflakeData.jsx
import React, { useState, useEffect } from 'react';

function SnowflakeData() {
const [data, setData] = useState([]);
const [query, setQuery] = useState('SELECT * FROM your_table LIMIT 10'); // Initial query
const [error, setError] = useState(null);

const fetchData = async () => {
try {
const response = await fetch('http://localhost:5000/execute-query', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ query }),
});

if (!response.ok) {
throw new Error(`HTTP error! Status: ${response.status}`);
}

const result = await response.json();
setData(result.data);
setError(null);
} catch (err) {
setError(err.message);
setData([]);
}
};

useEffect(() => {
fetchData();
}, []); // Fetch data on component mount

const handleQueryChange = (event) => {
setQuery(event.target.value);
};

const handleSubmit = (event) => {
event.preventDefault();
fetchData();
};

return (
<div>
<h1>Snowflake Data</h1>
<form onSubmit={handleSubmit}>
<label>
Enter Query:
<input
type="text"
value={query}
onChange={handleQueryChange}
/>
</label>
<button type="submit">Execute Query</button>
</form>
{error && <p style={{ color: 'red' }}>Error: {error}</p>}
<ul>
{data.map((row, index) => (
<li key={index}>{JSON.stringify(row)}</li>
))}
</ul>
</div>
);
}

export default SnowflakeData;
