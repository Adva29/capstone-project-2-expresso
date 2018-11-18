const express = require('express');
const apiRouter = express.Router();
const employeesRouter = require ('./employees.js');
const menusRouter = require ('./menus.js');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

// handles all calls to /employees
apiRouter.use('/employees', employeesRouter);

// handles all calls to /menus
apiRouter.use('/menus', menusRouter);


// exports the router
module.exports = apiRouter;
