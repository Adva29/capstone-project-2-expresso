const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite')

// creat Employee table
db.run(`CREATE TABLE IF NOT EXISTS Employee (
  id INTEGER PRIMARY KEY NOT NULL,
  name  TEXT NOT NULL,
  position TEXT NOT NULL,
  wage INTEGER NOT NULL,
  is_current_employee INTEGER default 1
 ) `);

//create Timesheet table
db.run(`CREATE TABLE IF NOT EXISTS Timesheet (
  id INTEGER PRIMARY KEY NOT NULL,
  hours INTEGER NOT NULL,
  rate INTEGER NOT NULL,
  date INTEGER NOT NULL,
  employee_id INTEGER FORIEGN KEY NOT NULL
 ) `);

 //create Menu table
 db.run(`CREATE TABLE IF NOT EXISTS Menu (
   id INTEGER PRIMARY KEY NOT NULL,
   title TEXT NOT NULL
  ) `);

  //create MenuItem table
  db.run(`CREATE TABLE IF NOT EXISTS MenuItem (
    id INTEGER PRIMARY KEY NOT NULL,
    name  TEXT NOT NULL,
    description TEXT,
    inventory INTEGER NOT NULL,
    price INTEGER NOT NULL,
    menu_id INTEGER FORIEGN KEY NOT NULL
       ) `);
