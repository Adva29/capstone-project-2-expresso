const express = require('express');

const menuItemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')


// router param for 'menuItemId'
menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  db.get(`SELECT * FROM MenuItem WHERE id = $menuItemId`, {
    $menuItemId: menuItemId
  }, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      res.sendStatus(404);
    }
  })
});

// get '/' all menuItems for menu
menuItemsRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`,
    (err, menuItems) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({menuItems: menuItems});
      }
    });
});

//post '/' - create new menuItemt
menuItemsRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;


  if (!name || !inventory || !price ) {
    return res.sendStatus(400)
    next;
  }

  const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)`;
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuId: menuId
  };
  db.run(sql, values, function (error) {
    if(error) {
      next(error)
    } else {
      db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (error, menuItem) => {
        res.status(201).json({menuItem: menuItem});
      });
    }
  });
});



//update menuItem via PUT
menuItemsRouter.put('/:menuItemId', (req, res, next) => {
const name = req.body.menuItem.name;
const description = req.body.menuItem.description;
const inventory = req.body.menuItem.inventory;
const price = req.body.menuItem.price;
const menuId = req.params.menuId;


if (!name || !inventory || !price ) {
  return res.sendStatus(400)
  next;
}
  const sql = `UPDATE MenuItem SET name = $name, description = $description,
      inventory = $inventory, price = $price, menu_id = $menuId
      WHERE MenuItem.id = $menuItemId`;
      const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: menuId,
        $menuItemId: req.params.menuItemId
      };
  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, (err, menuItem) => {
          res.status(200).json({ menuItem: menuItem });
      });
    }
  });
});

// delete specific menuItem
menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  db.run(`DELETE FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, (error)=>{
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  } );
});


// exports the router
module.exports = menuItemsRouter;
