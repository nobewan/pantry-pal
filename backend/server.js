require('dotenv').config();
const express = require('express');
const snowflake = require('snowflake-sdk');
const app = express();

app.get('/api/data', (req, res) => {
  const connection = snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT,
    username: process.env.SNOWFLAKE_USER,
    password: process.env.SNOWFLAKE_PASSWORD,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    database: process.env.SNOWFLAKE_DATABASE,
    schema: process.env.SNOWFLAKE_SCHEMA
  });

  connection.connect(err => {
    if (err) return res.status(500).send(err);
    connection.execute({
      sqlText: 'SELECT * FROM YOUR_TABLE LIMIT 50',
      complete: (err, stmt, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
      }
    });
  });
});

app.listen(5000, () => console.log('Backend running on port 5000'));
