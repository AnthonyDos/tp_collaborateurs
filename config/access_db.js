const mysql = require("mysql2");

const dbConnect = mysql.createConnection({
    host: process.env.HOST,
    database: process.env.DB_NAME,
    user: process.env.USER,
    password: process.env.DB_PASSWORD,
})

dbConnect.connect((err) => {
    if (err) {
      console.log({ err: err });
    } else {
      console.log("connecté à  Sql");
    }
});
  
module.exports = dbConnect;