const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.static('public'));
app.use(morgan('dev'));
app.use(bodyParser.json());










// Server listening
app.listen(PORT, () => {
  console.log(`Server is listening on Port: ${PORT}`)
}
);

// exports the app
module.exports = app;
