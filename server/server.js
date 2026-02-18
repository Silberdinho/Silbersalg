const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');

const app = express();

// Tillat CORS frå port 5500
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));

app.use(express.json());

// MariaDB connection pool
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'appuser',
  password: 'app123',
  database: 'silbersalg',
  connectionLimit: 5
});

// Test-endepunkt
app.get('/test', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT NOW() AS time');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Checkout-endepunkt
app.post('/checkout', async (req, res) => {
  const items = req.body.items;
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const orderResult = await conn.query(
      'INSERT INTO orders () VALUES ()'
    );
    const orderId = orderResult.insertId;

    for (let item of items) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_name) VALUES (?, ?)',
        [orderId, item]
      );
    }

    await conn.commit();
    res.json({ message: 'Order lagret', orderId: Number(orderId) });

  } catch (err) {
    if (conn) await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Kontaktskjema-endepunkt
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Validering
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Alle felt er påkrevd' });
  }

  let conn;

  try {
    conn = await pool.getConnection();
    
    await conn.query(
      'INSERT INTO contact_messages (name, email, message, created_at) VALUES (?, ?, ?, NOW())',
      [name, email, message]
    );

    res.json({ message: 'Melding lagret. Vi kontakter deg snart!' });

  } catch (err) {
    console.error('Kontaktskjema-feil:', err);
    res.status(500).json({ error: 'Kunne ikke lagre meldingen' });
  } finally {
    if (conn) conn.release();
  }
});

app.listen(3000, () => {
  console.log('Server kjører på http://localhost:3000');
});
