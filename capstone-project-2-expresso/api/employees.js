const express = require('express');

const employeesRouter = express.Router();
const sqlite3 = require('sqlite3');
const timesheetsRouter = require ('./timesheets.js');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')




// router param for 'employeeId'
employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  db.get(`SELECT * FROM Employee WHERE id = $employeeId`, {
    $employeeId: employeeId
  }, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  })
});

// handles all calls to /:employeeId/timesheets
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

// get '/' for employees
employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE is_current_employee = 1',
    (err, employees) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({employees: employees});
      }
    });
});


//post '/' - create new employee
employeesRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;

  const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;   // checks if 'is_current_employee' is set and if not sets it to 1
  if (!name || !position || !wage) {
    return res.sendStatus(400)
    next;
  }

  const sql = `INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)`;
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee
  };
  db.run(sql, values, function (error) {
    if(error) {
      next(error)
    } else {
      db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (error, employee) => {
        res.status(201).json({employee: employee});
      });
    }
  });
});

// get '/:employeeId' - get a specific employee
employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({ employee: req.employee})
} );


//update employee via PUT
employeesRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;

  const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;   // checks if 'is_current_employee' is set and if not sets it to 1
  if (!name || !position || !wage) {
    return res.sendStatus(400)
    next;
  }
  const sql = `UPDATE Employee SET name = $name, position = $position,
      wage = $wage, is_current_employee = $isCurrentEmployee
      WHERE Employee.id = $employeeId`;
      const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee,
        $employeeId: req.params.employeeId
      };
  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, employee) => {
          res.status(200).json({ employee: employee });
      });
    }
  });
});


//changes employee from employed to unemployed

employeesRouter.delete('/:employeeId', (req, res, next) => {
  db.run(`UPDATE Employee SET is_current_employee = 0
      WHERE Employee.id = ${req.params.employeeId}`, (error, employee) => {
        if(error){
          next(error);
        } else {
          db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, employee) => {
              res.status(200).json({ employee: employee });
          });
        }
      });
});



// exports the router
module.exports = employeesRouter;
