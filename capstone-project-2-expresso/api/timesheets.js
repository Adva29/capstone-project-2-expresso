const express = require('express');

const timesheetsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')


// router param for 'timesheetId'
timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  db.get(`SELECT * FROM Timesheet WHERE id = $timesheetId`, {
    $timesheetId: timesheetId
  }, (error, timesheet) => {
    if (error) {
      next(error);
    } else if (timesheet) {
      req.timesheet = timesheet;
      next();
    } else {
      res.sendStatus(404);
    }
  })
});

// get '/' all timesheets for employee
timesheetsRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`,
    (err, timesheets) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({timesheets: timesheets});
      }
    });
});

//post '/' - create new timesheet
timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId


  if (!hours || !rate || !date ) {
    return res.sendStatus(400)
    next;
  }

  const sql = `INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)`;
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: employeeId
  };
  db.run(sql, values, function (error) {
    if(error) {
      next(error)
    } else {
      db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (error, timesheet) => {
        res.status(201).json({timesheet: timesheet});
      });
    }
  });
});



//update timesheet via PUT
timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId


  if (!hours || !rate || !date ) {
    return res.sendStatus(400)
    next;
  }
  const sql = `UPDATE Timesheet SET hours = $hours, rate = $rate,
      date = $date, employee_id = $employeeId
      WHERE Timesheet.id = $timesheetId`;
      const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId,
        $timesheetId: req.params.timesheetId
      };
  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, (err, timesheet) => {
          res.status(200).json({ timesheet: timesheet });
      });
    }
  });
});

// delete specific timesheet
timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  db.run(`DELETE FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, (error)=>{
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  } );
});


// exports the router
module.exports = timesheetsRouter;
