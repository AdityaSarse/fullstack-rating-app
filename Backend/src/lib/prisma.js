// src/lib/prisma.js
//
// Prisma Client singleton — Prisma 7 with PostgreSQL driver adapter.
//
// Prisma 7 requires an explicit driver adapter for direct database connections.
// Architecture:
//
//   .env (DATABASE_URL)
//       ↓
//   pg Pool
//       ↓
//   PrismaPg adapter
//       ↓
//   PrismaClient
//       ↓
//   PostgreSQL

require("dotenv/config");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
