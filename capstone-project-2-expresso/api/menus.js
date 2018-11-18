const express = require('express');

const menusRouter = express.Router();
const sqlite3 = require('sqlite3');
const menuItemsRouter = require ('./menu-items.js');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')


// router param for 'menuId'
menusRouter.param('menuId', (req, res, next, menuId) => {
  db.get(`SELECT * FROM Menu WHERE id = $menuId`, {
    $menuId: menuId
  }, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  })
});

// handles all calls to /:menuId/menu-items
menusRouter.use('/:menuId/menu-items', menuItemsRouter);



// get '/' for all menus
menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu',
    (err, menus) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({menus: menus});
      }
    });
});

//post '/' - create new menu
menusRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    return res.sendStatus(400)
    next;
  }

  const sql = `INSERT INTO menu (title) VALUES ($title)`;
  const values = {
    $title: title
  };
  db.run(sql, values, function (error) {
    if(error) {
      next(error)
    } else {
      db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (error, menu) => {
        res.status(201).json({menu: menu});
      });
    }
  });
});

// get '/:menuId' - get a specific menu
menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({ menu: req.menu})
} );


//update employee via PUT
menusRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    return res.sendStatus(400)
    next;
  }
  const sql = `UPDATE Menu SET title = $title
      WHERE Menu.id = $menuId`;
      const values = {
        $title: title,
        $menuId: req.params.menuId
      };
  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (err, menu) => {
          res.status(200).json({ menu: menu });
      });
    }
  });
});


//delete menu

menusRouter.delete('/:menuId', (req, res, next) => {
  db.get(`SELECT * FROM MenuItem WHERE MenuItem.menu_id= ${req.params.menuId}`, (error, menuItem)=> {
    if(menuItem){
      return res.sendStatus(400)
      next;
    }
    else {
      db.run(`DELETE FROM Menu WHERE Menu.id = ${req.params.menuId}`, (error)=>{
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});



// exports the router
module.exports = menusRouter;
