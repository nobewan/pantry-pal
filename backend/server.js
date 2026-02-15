require('dotenv').config();
const express = require('express');
const cors = require('cors');
const snowflake = require('snowflake-sdk');

const app = express();
const PORT = 5000;

// ------------------ Whitelist of allowed tables ------------------
const allowedTables = ["PANTRYPAL2", "GREENBANANA", "BANANA", "RIPE", "PANTRYPAL3"];

// ------------------ CORS Setup ------------------
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// ------------------ Snowflake Connection ------------------
const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USER,
  password: process.env.SNOWFLAKE_PASSWORD,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA
});

connection.connect((err, conn) => {
  if (err) console.error('Unable to connect to Snowflake: ', err);
  else console.log('Connected to Snowflake successfully!');
});

// ------------------ Helper Function ------------------
function fetchTableData(tableName, res) {
  const query = `SELECT TIME, GAS, TEMP, HUMIDITY, PRESSURE FROM ${tableName} LIMIT 150`;

  connection.execute({
    sqlText: query,
    complete: (err, stmt, rows) => {
      if (err) {
        console.error(`Snowflake query error (${tableName}): `, err);
        res.status(500).json({ error: `Failed to fetch data from ${tableName}` });
      } else {
        res.json(rows);
      }
    }
  });
}

// ------------------ API Route ------------------
// Example: GET /api/snowflake-data?table=RIPE
app.get('/api/snowflake-data', (req, res) => {
  const table = req.query.table;

  if (!table) return res.status(400).json({ error: "Missing 'table' query parameter" });
  if (!allowedTables.includes(table)) return res.status(400).json({ error: "Invalid table" });

  fetchTableData(table, res);
});

// ------------------ Start Server ------------------
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});