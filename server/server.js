const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://silberdinho.github.io'
];

if (process.env.FRONTEND_ORIGIN) {
  allowedOrigins.push(
    ...process.env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  );
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

function isSupabaseConfigured() {
  return Boolean(supabase);
}

function ensureSupabaseConfigured(res) {
  if (isSupabaseConfigured()) return true;
  res.status(503).json({
    error: 'Database er ikke konfigurert. Sett SUPABASE_URL og SUPABASE_SERVICE_ROLE_KEY i server/.env'
  });
  return false;
}

app.get('/test', async (req, res) => {
  res.json({
    ok: true,
    supabaseConfigured: isSupabaseConfigured()
  });
});

app.post('/checkout', async (req, res) => {
  if (!ensureSupabaseConfigured(res)) return;

  const items = req.body.items;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Handlekurven er tom eller ugyldig' });
  }

  try {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({})
      .select('order_id')
      .single();

    if (orderError) throw orderError;

    const orderId = orderData.order_id;
    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_name: String(item)
    }));

    const { error: itemError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemError) throw itemError;

    res.json({ message: 'Order lagret', orderId: Number(orderId) });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Kunne ikke lagre ordre' });
  }
});

app.post('/api/contact', async (req, res) => {
  if (!ensureSupabaseConfigured(res)) return;

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Alle felt er påkrevd' });
  }

  try {
    const { error } = await supabase
      .from('contact_messages')
      .insert({ name, email, message });

    if (error) throw error;

    res.json({ message: 'Melding lagret. Vi kontakter deg snart!' });
  } catch (err) {
    console.error('Kontaktskjema-feil:', err);
    res.status(500).json({ error: err.message || 'Kunne ikke lagre meldingen' });
  }
});

app.listen(port, () => {
  console.log(`Server kjører på http://localhost:${port}`);
});
