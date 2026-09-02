// scripts/db-test.js
// Temporary connectivity test — DELETE this file after confirming the connection.
//
// Run with:
//   node scripts/db-test.js
//
// What it does:
//   1. Imports the shared Prisma client (same instance the API will use)
//   2. Executes a minimal read-only query: count rows in each table
//   3. Prints a clear pass/fail message
//   4. Always disconnects Prisma — no hanging process

require("dotenv/config");
const prisma = require("../src/lib/prisma");

async function testConnection() {
  console.log("⏳ Testing database connection via Prisma Client...\n");

  try {
    // Lightweight read-only queries — just count rows in each table.
    // These will return 0 on a fresh database, which is expected and correct.
    const [userCount, storeCount, ratingCount] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    console.log("✅ Connection successful!\n");
    console.log("Table row counts (all 0 on a fresh database):");
    console.log(`  users   → ${userCount}`);
    console.log(`  stores  → ${storeCount}`);
    console.log(`  ratings → ${ratingCount}`);
    console.log("\n🎉 Prisma Client ↔ PostgreSQL link is working.");
  } catch (error) {
    console.error("❌ Connection FAILED.\n");
    console.error("Error details:", error.message);
    console.error(
      "\nCommon causes:\n" +
        "  • PostgreSQL is not running\n" +
        "  • DATABASE_URL in .env is wrong (user/password/host/port/dbname)\n" +
        "  • The database 'fullstack_rating_db' does not exist\n" +
        "  • Migration was not run (run: npx prisma migrate dev --name init)"
    );
    process.exit(1);
  } finally {
    // Always disconnect so the Node process exits cleanly.
    await prisma.$disconnect();
  }
}

testConnection();
