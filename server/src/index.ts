import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
====================================================
 🏃 Udupipages Beach Run 2026 API Server Running
 📡 URL: http://localhost:${PORT}
 💳 Razorpay Mode: ${process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live') ? 'LIVE 🔴' : 'TEST 🧪'}
====================================================
  `);
});
