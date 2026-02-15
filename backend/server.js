require('dotenv').config();
const express = require('express');
const cors = require('cors');
const snowflake = require('snowflake-sdk');

const app = express();
const PORT = 5000;

// CORS setup
app.use(cors({
  origin: "http://localhost:5173", // React dev server
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Snowflake connection
const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USER,
  password: process.env.SNOWFLAKE_PASSWORD,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA
});

// Connect at server start
connection.connect((err, conn) => {
  if (err) {
    console.error('Unable to connect to Snowflake: ', err);
  } else {
    console.log('Connected to Snowflake successfully!');
  }
});

// API route
app.get('/api/snowflake-data', (req, res) => {
  const query = 'SELECT TIME, GAS, TEMP, HUMIDITY, PRESSURE FROM PANTRYPAL2 LIMIT 50';

  // Ensure Snowflake callback sets CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  connection.execute({
    sqlText: query,
    complete: (err, stmt, rows) => {
      if (err) {
        console.error('Snowflake query error: ', err);
        res.status(500).json({ error: 'Failed to fetch data' });
      } else {
        res.json(rows);
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
