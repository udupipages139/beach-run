import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function setupDatabase() {
  if (!connectionString) {
    console.error('DATABASE_URL is not set in environment variables.');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('[PostgreSQL] Connected to Supabase DB successfully.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id UUID PRIMARY KEY,
        registration_number VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        age INT NOT NULL,
        category_id VARCHAR(50) NOT NULL,
        category_name VARCHAR(100) NOT NULL,
        tshirt_size VARCHAR(20) NOT NULL,
        emergency_contact VARCHAR(100) NOT NULL,
        previous_experience TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        amount_paid NUMERIC(10, 2) DEFAULT 0,
        razorpay_order_id VARCHAR(100),
        razorpay_payment_id VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('[PostgreSQL] Table "registrations" created/verified successfully!');
    await client.end();
  } catch (err) {
    console.error('[PostgreSQL] Database setup error:', err);
    process.exit(1);
  }
}

setupDatabase();
