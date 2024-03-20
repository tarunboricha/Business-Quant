import express from "express";
import mysql from "mysql";
import { config } from 'dotenv'
import cors from "cors";

config();
const app = express();

app.use(cors({
    credentials: true,
    origin: "*"
  }));

const databaseConfiguration = {
    connectionLimit: 10,
    host: process.env.HOST,
    user: process.env.USER,
    password: "",
    database: process.env.DATABASE,
};

const pool = mysql.createPool(databaseConfiguration);

app.get('/api/ticker=:ticker&column=:columns&period=:period', (req, res) => {
    const { ticker, columns, period } = req.params;

    console.log(period);
    const currentDate = new Date();
    const fiveYearsAgo = new Date(currentDate.getFullYear() - parseInt(period), currentDate.getMonth(), currentDate.getDate());
    const formattedDate = fiveYearsAgo.getFullYear() + '-' + ('0' + (fiveYearsAgo.getMonth() + 1)).slice(-2) + '-' + ('0' + fiveYearsAgo.getDate()).slice(-2);

    const query = `SELECT ${columns} FROM financial_data WHERE ticker = '${ticker}' AND date >= '${formattedDate}'`;
    console.log(query);
    pool.query(query, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.status(200).json(results);
        }
    });
});

app.get('/api/ticker=:ticker&column=:columns', (req, res) => {
    const { ticker, columns } = req.params;

    const query = `SELECT ${columns} FROM financial_data WHERE ticker = '${ticker}';`;
    console.log(query);
    pool.query(query, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.status(200).json(results);
        }
    });
});

app.get('/api/ticker=:ticker', (req, res) => {
    const ticker = req.params.ticker;
    const query = 'SELECT * FROM financial_data WHERE ticker = ?';
    console.log(query);
    pool.query(query, [ticker], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.status(200).json(results);
        }
    });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is started sucessfully on port ${PORT}`);
});