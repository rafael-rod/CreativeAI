const { Pool } = require('pg')
require('dotenv').config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error("DATABASE_URL is not set in .env")
  process.exit(1)
}

console.log("Testing connection to:", connectionString.replace(/:[^:/@]+@/, ':****@')) // Log masked URL

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for RDS in many cases to avoid self-signed cert errors
  }
})

async function main() {
  try {
    const client = await pool.connect()
    console.log("✅ Successfully connected to PostgreSQL!")
    
    const res = await client.query('SELECT NOW()')
    console.log("Current time from DB:", res.rows[0].now)
    
    client.release()
  } catch (err) {
    console.error("❌ Connection Failed:", err.message)
    console.error("Full Error:", err)
  } finally {
    await pool.end()
  }
}

main()
