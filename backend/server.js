const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());  // to parse JSON body

const db = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'crud_app',
  password: 'jaswanth',
  port: 5432
});

app.get('/', (req, res) => {
  const pgql = "SELECT * FROM users"; 
  db.query(pgql, (err, data) => {
    if (err) {
      console.error('DB Error:', err);  
      return res.json('error');
    }
    return res.json(data.rows);  
  });
});

app.post('/create', (req, res) => {
  const { name, email } = req.body;

  const insert = "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *"; 
  const values = [name, email];

  db.query(insert, values, (err, result) => {
    if (err) {
      console.error('Error adding student:', err);
      return res.status(500).json({ error: 'Failed to add student' });
    }

    return res.status(201).json(result.rows[0]); 
  });
});

// Update student by ID
app.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  const update = "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *";

  db.query(update, [name, email, id], (err, result) => {
    if (err) {
      console.error('Error updating student:', err);
      return res.status(500).json({ error: 'Failed to update student' });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    return res.status(200).json(result.rows[0]);  
  });
});


// Delete student by ID
app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;  

  const deletesql = "DELETE FROM users WHERE id = $1 RETURNING *";  

  db.query(deletesql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting student:', err);
      return res.status(500).json({ error: 'Failed to delete student' });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    return res.status(200).json({ message: 'Student deleted successfully' });
  });
});




app.listen(8000, () => {
  console.log('listening on port 8000');
});
