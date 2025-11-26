const { createPool } = require("mysql");

const pool = createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.MYSQL_DB,
    connectionLimit: 10
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("DB connection failed:", err);
  } else {
    console.log("DB connected!");
    connection.release();
  }
});

module.exports = pool;
