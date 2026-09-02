// prisma/seed.js
//
// Development seed script — creates a predictable dataset for testing.
//
// Run with:
//   npx prisma db seed
//
// Idempotent: running multiple times produces the same result (no duplicates).
// Uses upsert on unique fields (email for users, ownerId for store,
// [userId, storeId] for ratings).
//
// Test accounts created:
//   admin@example.com   → ADMIN
//   user1@example.com   → USER  (Rahul Sharma)
//   user2@example.com   → USER  (Priya Patil)
//   owner@example.com   → STORE_OWNER
//
// Store:
//   Tech World (owned by owner@example.com)
//
// Ratings:
//   Rahul  → Tech World → 5 ⭐
//   Priya  → Tech World → 4 ⭐
//   Average: 4.5
//
// Password for all accounts: Test@1234

require("dotenv/config");
const bcrypt = require("bcryptjs");
const prisma = require("../src/lib/prisma");

// Single shared password for all dev accounts.
// Satisfies: 8–16 chars, uppercase, special character.
const DEV_PASSWORD = "Test@1234";
const SALT_ROUNDS = 12;

async function seed() {
  console.log("🌱 Seeding database...\n");

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, SALT_ROUNDS);

  // ── Users ────────────────────────────────────────────────────────────────

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "System Administrator",
      email: "admin@example.com",
      passwordHash,
      address: "123 Admin Street, Mumbai, Maharashtra",
      role: "ADMIN",
    },
  });
  console.log(`✅ ADMIN       → ${admin.email}`);

  const user1 = await prisma.user.upsert({
    where: { email: "user1@example.com" },
    update: {},
    create: {
      name: "Rahul Sharma",
      email: "user1@example.com",
      passwordHash,
      address: "45 MG Road, Bengaluru, Karnataka",
      role: "USER",
    },
  });
  console.log(`✅ USER        → ${user1.email}`);

  const user2 = await prisma.user.upsert({
    where: { email: "user2@example.com" },
    update: {},
    create: {
      name: "Priya Patil",
      email: "user2@example.com",
      passwordHash,
      address: "78 FC Road, Pune, Maharashtra",
      role: "USER",
    },
  });
  console.log(`✅ USER        → ${user2.email}`);

  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      name: "Store Owner",
      email: "owner@example.com",
      passwordHash,
      address: "12 Koregaon Park, Pune, Maharashtra",
      role: "STORE_OWNER",
    },
  });
  console.log(`✅ STORE_OWNER → ${owner.email}`);

  // ── Store ─────────────────────────────────────────────────────────────────
  // Upsert on ownerId (unique) — one store per owner.

  const store = await prisma.store.upsert({
    where: { ownerId: owner.id },
    update: {},
    create: {
      name: "Tech World",
      email: "store@example.com",
      address: "Pune, Maharashtra",
      ownerId: owner.id,
    },
  });
  console.log(`\n✅ STORE       → ${store.name} (owned by ${owner.email})`);

  // ── Ratings ───────────────────────────────────────────────────────────────
  // Upsert on @@unique([userId, storeId]) — one rating per user/store pair.

  await prisma.rating.upsert({
    where: { userId_storeId: { userId: user1.id, storeId: store.id } },
    update: {},
    create: {
      userId: user1.id,
      storeId: store.id,
      value: 5,
    },
  });
  console.log(`✅ RATING      → ${user1.name} → ${store.name} → ⭐ 5`);

  await prisma.rating.upsert({
    where: { userId_storeId: { userId: user2.id, storeId: store.id } },
    update: {},
    create: {
      userId: user2.id,
      storeId: store.id,
      value: 4,
    },
  });
  console.log(`✅ RATING      → ${user2.name} → ${store.name} → ⭐ 4`);

  console.log("\n📊 Expected average rating for Tech World: 4.5");
  console.log("\n🎉 Seed complete. All accounts use password: Test@1234");
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
