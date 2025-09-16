const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'test',
  password: '********' // replace with your MySQL root password
});  

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password()
  ];
};

// HOME route
app.get('/', (req, res) => {
  let q = `SELECT count(*) FROM users;`
  try {
    connection.query(q, (err, results) => {
      if (err) throw err;
      let count = results[0]['count(*)'];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

// SHOW route
app.get('/users', (req, res) => {
  let q = `SELECT * FROM users;`
  try {
    connection.query(q, (err, results) => {
      if (err) throw err;
      res.render("users.ejs", { users: results });
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

// Edit route
app.get('/user/:id/edit', (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM users WHERE id = '${id}';`
  try {
    connection.query(q, (err, results) => {
      if (err) throw err;
      res.render("edit.ejs", { user: results[0] });
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

// Update route
app.patch('/user/:id', (req, res) => {
  let { id } = req.params;
  let { username: newUsername, email: newEmail, password: formPass } = req.body;
  const q = `SELECT * FROM users WHERE id = ?`;

  connection.query(q, [id], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database error");
    }
    if (results.length === 0) {
      return res.status(404).send("User not found");
    }
    const user = results[0];

    // Check password
    if (formPass !== user.password) {
      return res.send("Password incorrect");
    }

    // Update username and email
    const updateQuery = `UPDATE users SET username = ?, email = ? WHERE id = ?`;
    connection.query(updateQuery, [newUsername, newEmail, id], (err2, updateResults) => {
      if (err2) {
        console.log(err2);
        return res.status(500).send("Failed to update user");
      }

      // Success: redirect or send message
      res.redirect('/users');
    });
  });
});

  
  // Route to show signup form
app.get('/users/new', (req, res) => {
  res.render('newUser');  // must match views/newUser.ejs
});

  const { v4: uuidv4 } = require('uuid'); // add this at the top of your index.js

// Create User Route
app.post('/users', (req, res) => {
  const { username, email, password } = req.body; 
  const id = uuidv4(); 

  const query = `INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)`;

  connection.query(query, [id, username, email, password], (err, result) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).send('Error inserting user');
    }
    res.redirect('/users'); 
  });
});




  // Delete User Route
  app.delete('/user/:id', (req, res) => {
      const { id } = req.params;
      const query = `DELETE FROM users WHERE id = ?`;
      
      connection.query(query, [id], (err, result) => {
          if (err) {
              console.log(err);
              return res.status(500).send('Error deleting user');
          }

          res.redirect('/users');  
      });
  });



app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
