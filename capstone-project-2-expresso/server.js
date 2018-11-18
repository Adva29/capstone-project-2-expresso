const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const apiRouter = require('./api/api');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.static('public'));
app.use(cors());
app.use(errorhandler());
app.use(morgan('dev'));
app.use(bodyParser.json());

//router to all /api requests
app.use('/api', apiRouter);



// Server listening
app.listen(PORT, () => {
  console.log(`Server is listening on Port: ${PORT}`)
}
);

// exports the app
module.exports = app;
