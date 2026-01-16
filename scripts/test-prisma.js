const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
require('dotenv').config()

async function main() {
  console.log("Attempting to import PrismaClient...")
  try {
    const connectionString = process.env.DATABASE_URL
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    
    const prisma = new PrismaClient({
      adapter,
    })
    console.log("PrismaClient instantiated.")
    await prisma.$connect()
    console.log("Successfully connected to the database!")
    const count = await prisma.user.count()
    console.log(`Found ${count} users.`)
    await prisma.$disconnect()
  } catch (e) {
    console.error("Error connecting to database:", e)
    process.exit(1)
  }
}

main()
