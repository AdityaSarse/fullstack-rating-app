// prisma/seed.js
//
// Comprehensive Development Seed Script
// Creates a rich, realistic dataset for UI testing, demos, and evaluation.
//
// Dataset Summary:
//   • 1 ADMIN (admin@example.com)
//   • 10 STORE_OWNER accounts (owner@example.com .. owner10@example.com)
//   • 25 USER accounts (user1@example.com .. user25@example.com)
//   • 10 Stores across Pune/Maharashtra
//   • 80 Ratings with varied, natural distribution
//   • 3 Users with 0 ratings (for testing unrated states)
//
// Single password for all accounts: Test@1234
// Idempotent: safe to run multiple times without creating duplicates.

require("dotenv/config");
const bcrypt = require("bcryptjs");
const prisma = require("../src/lib/prisma");

const DEV_PASSWORD = "Test@1234";
const SALT_ROUNDS = 12;

async function seed() {
  console.log("🌱 Seeding database with comprehensive demo dataset...\n");

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, SALT_ROUNDS);

  // ── 1. Admin ─────────────────────────────────────────────────────────────

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "System Administrator",
      email: "admin@example.com",
      passwordHash,
      address: "123 Admin Towers, Nariman Point, Mumbai, Maharashtra 400021",
      role: "ADMIN",
    },
  });
  console.log(`✅ ADMIN       → ${admin.email} (${admin.name})`);

  // ── 2. 10 Store Owners ───────────────────────────────────────────────────

  const ownersData = [
    {
      email: "owner@example.com",
      name: "Store Owner Enterprise",
      address: "12 Koregaon Park, Pune, Maharashtra 411001",
    },
    {
      email: "owner2@example.com",
      name: "Rajesh Kumar Electronics",
      address: "88 Viman Nagar Road, Pune, Maharashtra 411014",
    },
    {
      email: "owner3@example.com",
      name: "Sunil Devendra Sharma",
      address: "45 Fergusson College Road, Pune, Maharashtra 411004",
    },
    {
      email: "owner4@example.com",
      name: "Vikramaditya Rao Bhosale",
      address: "21 Magarpatta Road, Hadapsar, Pune, Maharashtra 411028",
    },
    {
      email: "owner5@example.com",
      name: "Mahesh Chandrakant Joshi",
      address: "67 Senapati Bapat Road, Pune, Maharashtra 411016",
    },
    {
      email: "owner6@example.com",
      name: "Anand Prakash Shrivastav",
      address: "102 Law College Road, Erandwane, Pune, Maharashtra 411004",
    },
    {
      email: "owner7@example.com",
      name: "Dhananjay Ramesh Kulkarni",
      address: "55 Shankar Sheth Road, Swargate, Pune, Maharashtra 411042",
    },
    {
      email: "owner8@example.com",
      name: "Pramod Yashwant Deshpande",
      address: "14 Prabhat Road, Deccan, Pune, Maharashtra 411004",
    },
    {
      email: "owner9@example.com",
      name: "Ganesh Balasaheb Jagtap",
      address: "73 Old Mumbai-Pune Highway, Chinchwad, Pune, Maharashtra 411033",
    },
    {
      email: "owner10@example.com",
      name: "Siddharth Manohar Kadam",
      address: "89 Phase 1 IT Park, Hinjawadi, Pune, Maharashtra 411057",
    },
  ];

  const owners = {};
  for (const o of ownersData) {
    const createdOwner = await prisma.user.upsert({
      where: { email: o.email },
      update: {},
      create: {
        name: o.name,
        email: o.email,
        passwordHash,
        address: o.address,
        role: "STORE_OWNER",
      },
    });
    owners[o.email] = createdOwner;
  }
  console.log(`✅ STORE_OWNERS → 10 Store Owner accounts created`);

  // ── 3. 25 Normal Users ───────────────────────────────────────────────────

  const usersData = [
    { email: "user1@example.com", name: "Rahul Rameshwar Sharma", address: "45 MG Road, Camp, Pune, Maharashtra 411001" },
    { email: "user2@example.com", name: "Priya Digambar Patil", address: "78 FC Road, Shivajinagar, Pune, Maharashtra 411005" },
    { email: "user3@example.com", name: "Aarav Krishnan Nambiar", address: "12 Aundh Road, Baner, Pune, Maharashtra 411007" },
    { email: "user4@example.com", name: "Ananya Suresh Deshmukh", address: "56 Kothrud Paud Road, Pune, Maharashtra 411038" },
    { email: "user5@example.com", name: "Rohan Jayant Kulkarni", address: "99 Sinhagad Road, Dattawadi, Pune, Maharashtra 411030" },
    { email: "user6@example.com", name: "Sneha Arvind Gaikwad", address: "34 Nagar Road, Kalyani Nagar, Pune, Maharashtra 411006" },
    { email: "user7@example.com", name: "Aditya Narayan Shinde", address: "15 Karve Road, Erandwane, Pune, Maharashtra 411004" },
    { email: "user8@example.com", name: "Kavita Bhaskar Jadhav", address: "82 Satara Road, Bibvewadi, Pune, Maharashtra 411037" },
    { email: "user9@example.com", name: "Amitabh Harishchandra Verma", address: "23 Solapur Road, Hadapsar, Pune, Maharashtra 411028" },
    { email: "user10@example.com", name: "Pooja Shashikant More", address: "19 Hinjawadi Phase 1, Pune, Maharashtra 411057" },
    { email: "user11@example.com", name: "Kiran Vishwanath Chavan", address: "61 Model Colony, Shivajinagar, Pune, Maharashtra 411016" },
    { email: "user12@example.com", name: "Meera Ramchandra Nair", address: "44 Pashan Sus Road, Pashan, Pune, Maharashtra 411021" },
    { email: "user13@example.com", name: "Sanjay Dattatray Pawar", address: "88 Pune-Nashik Highway, Bhosari, Pune, Maharashtra 411039" },
    { email: "user14@example.com", name: "Deepika Manohar Tambe", address: "27 Airport Road, Yerawada, Pune, Maharashtra 411006" },
    { email: "user15@example.com", name: "Nikhil Prakash Gokhale", address: "39 Tilak Road, Sadashiv Peth, Pune, Maharashtra 411030" },
    { email: "user16@example.com", name: "Tanvi Chandrashekhar Rane", address: "92 Bavdhan Main Road, Bavdhan, Pune, Maharashtra 411021" },
    { email: "user17@example.com", name: "Omkar Shrikant Kulkarni", address: "18 DP Road, Aundh, Pune, Maharashtra 411007" },
    { email: "user18@example.com", name: "Rhea Bhupendra Rathod", address: "73 Salunke Vihar Road, Wanowrie, Pune, Maharashtra 411040" },
    { email: "user19@example.com", name: "Varun Dilip Chandorkar", address: "50 Alandi Road, Vishrantwadi, Pune, Maharashtra 411015" },
    { email: "user20@example.com", name: "Isha Ravindra Sonawane", address: "31 Katraj-Kondhwa Road, Katraj, Pune, Maharashtra 411046" },
    { email: "user21@example.com", name: "Harshwardhan Ajay Mane", address: "64 Wakad Highway Road, Wakad, Pune, Maharashtra 411057" },
    { email: "user22@example.com", name: "Shreya Vilasrao Salunkhe", address: "16 University Road, Ganeshkhind, Pune, Maharashtra 411007" },
    // Users 23–25 have 0 ratings seeded for testing unrated user empty states
    { email: "user23@example.com", name: "Devendra Gajanan Khare", address: "95 Ghole Road, Shivajinagar, Pune, Maharashtra 411004" },
    { email: "user24@example.com", name: "Swati Chandrakant Kale", address: "42 Gangadham Chowk, Market Yard, Pune, Maharashtra 411037" },
    { email: "user25@example.com", name: "Abhishek Vinayak Joshi", address: "11 Paud Road, Ideal Colony, Kothrud, Pune, Maharashtra 411038" },
  ];

  const users = {};
  for (const u of usersData) {
    const createdUser = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
        address: u.address,
        role: "USER",
      },
    });
    users[u.email] = createdUser;
  }
  console.log(`✅ USERS        → 25 Normal User accounts created (3 without ratings)`);

  // ── 4. 10 Stores ─────────────────────────────────────────────────────────

  const storesData = [
    {
      ownerId: owners["owner@example.com"].id,
      name: "Tech World",
      email: "techworld@store.com",
      address: "Shop 14, Westend Mall, Aundh, Pune, Maharashtra 411007",
    },
    {
      ownerId: owners["owner2@example.com"].id,
      name: "Gadget Hub",
      email: "gadgethub@store.com",
      address: "Phoenix Marketcity, Viman Nagar, Pune, Maharashtra 411014",
    },
    {
      ownerId: owners["owner3@example.com"].id,
      name: "Mobile Point",
      email: "mobilepoint@store.com",
      address: "Deccan 99 Mall, FC Road, Pune, Maharashtra 411004",
    },
    {
      ownerId: owners["owner4@example.com"].id,
      name: "Digital Planet",
      email: "digitalplanet@store.com",
      address: "Amanora Town Centre, Hadapsar, Pune, Maharashtra 411028",
    },
    {
      ownerId: owners["owner5@example.com"].id,
      name: "Smart Electronics",
      email: "smartelectronics@store.com",
      address: "Seasons Mall, Magarpatta City, Pune, Maharashtra 411013",
    },
    {
      ownerId: owners["owner6@example.com"].id,
      name: "Laptop House",
      email: "laptophouse@store.com",
      address: "Pavilion Mall, Senapati Bapat Road, Pune, Maharashtra 411016",
    },
    {
      ownerId: owners["owner7@example.com"].id,
      name: "Phone Zone",
      email: "phonezone@store.com",
      address: "Kumar Pacific Mall, Shankar Sheth Road, Pune, Maharashtra 411042",
    },
    {
      ownerId: owners["owner8@example.com"].id,
      name: "Computer World",
      email: "computerworld@store.com",
      address: "ICC Trade Tower, Senapati Bapat Road, Pune, Maharashtra 411016",
    },
    {
      ownerId: owners["owner9@example.com"].id,
      name: "Electro Mart",
      email: "electromart@store.com",
      address: "Elpro City Square, Chinchwad, Pune, Maharashtra 411033",
    },
    {
      ownerId: owners["owner10@example.com"].id,
      name: "Future Gadgets",
      email: "futuregadgets@store.com",
      address: "Grand Highstreet, Hinjawadi Phase 1, Pune, Maharashtra 411057",
    },
  ];

  const stores = {};
  for (const s of storesData) {
    const createdStore = await prisma.store.upsert({
      where: { ownerId: s.ownerId },
      update: {
        name: s.name,
        email: s.email,
        address: s.address,
      },
      create: {
        name: s.name,
        email: s.email,
        address: s.address,
        ownerId: s.ownerId,
      },
    });
    stores[s.name] = createdStore;
  }
  console.log(`✅ STORES       → 10 Registered Stores created`);

  // ── 5. 80 Ratings ────────────────────────────────────────────────────────

  const ratingsToSeed = [
    // 1. Tech World (18 ratings, Avg: ~4.6 ⭐)
    { userEmail: "user1@example.com", storeName: "Tech World", value: 5 },
    { userEmail: "user2@example.com", storeName: "Tech World", value: 5 },
    { userEmail: "user3@example.com", storeName: "Tech World", value: 5 },
    { userEmail: "user4@example.com", storeName: "Tech World", value: 5 },
    { userEmail: "user5@example.com", storeName: "Tech World", value: 5 },
    { userEmail: "user6@example.com", storeName: "Tech World", value: 5 },
    { userEmail: "user7@example.com", storeName: "Tech World", value: 5 },
    { userEmail: "user8@example.com", storeName: "Tech World", value: 5 },
    { userEmail: "user9@example.com", storeName: "Tech World", value: 5 },
    { userEmail: "user10@example.com", storeName: "Tech World", value: 5 },
    { userEmail: "user11@example.com", storeName: "Tech World", value: 5 },
    { userEmail: "user12@example.com", storeName: "Tech World", value: 4 },
    { userEmail: "user13@example.com", storeName: "Tech World", value: 4 },
    { userEmail: "user14@example.com", storeName: "Tech World", value: 4 },
    { userEmail: "user15@example.com", storeName: "Tech World", value: 4 },
    { userEmail: "user16@example.com", storeName: "Tech World", value: 4 },
    { userEmail: "user17@example.com", storeName: "Tech World", value: 4 },
    { userEmail: "user18@example.com", storeName: "Tech World", value: 3 },

    // 2. Gadget Hub (11 ratings, Avg: ~4.2 ⭐)
    { userEmail: "user1@example.com", storeName: "Gadget Hub", value: 5 },
    { userEmail: "user2@example.com", storeName: "Gadget Hub", value: 5 },
    { userEmail: "user3@example.com", storeName: "Gadget Hub", value: 4 },
    { userEmail: "user4@example.com", storeName: "Gadget Hub", value: 4 },
    { userEmail: "user5@example.com", storeName: "Gadget Hub", value: 4 },
    { userEmail: "user6@example.com", storeName: "Gadget Hub", value: 4 },
    { userEmail: "user7@example.com", storeName: "Gadget Hub", value: 4 },
    { userEmail: "user8@example.com", storeName: "Gadget Hub", value: 4 },
    { userEmail: "user9@example.com", storeName: "Gadget Hub", value: 4 },
    { userEmail: "user10@example.com", storeName: "Gadget Hub", value: 4 },
    { userEmail: "user11@example.com", storeName: "Gadget Hub", value: 4 },

    // 3. Mobile Point (14 ratings, Avg: ~4.7 ⭐)
    { userEmail: "user1@example.com", storeName: "Mobile Point", value: 5 },
    { userEmail: "user3@example.com", storeName: "Mobile Point", value: 5 },
    { userEmail: "user5@example.com", storeName: "Mobile Point", value: 5 },
    { userEmail: "user7@example.com", storeName: "Mobile Point", value: 5 },
    { userEmail: "user9@example.com", storeName: "Mobile Point", value: 5 },
    { userEmail: "user11@example.com", storeName: "Mobile Point", value: 5 },
    { userEmail: "user12@example.com", storeName: "Mobile Point", value: 5 },
    { userEmail: "user13@example.com", storeName: "Mobile Point", value: 5 },
    { userEmail: "user14@example.com", storeName: "Mobile Point", value: 5 },
    { userEmail: "user15@example.com", storeName: "Mobile Point", value: 5 },
    { userEmail: "user16@example.com", storeName: "Mobile Point", value: 4 },
    { userEmail: "user17@example.com", storeName: "Mobile Point", value: 4 },
    { userEmail: "user18@example.com", storeName: "Mobile Point", value: 4 },
    { userEmail: "user19@example.com", storeName: "Mobile Point", value: 4 },

    // 4. Digital Planet (7 ratings, Avg: ~3.9 ⭐)
    { userEmail: "user2@example.com", storeName: "Digital Planet", value: 5 },
    { userEmail: "user4@example.com", storeName: "Digital Planet", value: 4 },
    { userEmail: "user6@example.com", storeName: "Digital Planet", value: 4 },
    { userEmail: "user8@example.com", storeName: "Digital Planet", value: 4 },
    { userEmail: "user10@example.com", storeName: "Digital Planet", value: 4 },
    { userEmail: "user12@example.com", storeName: "Digital Planet", value: 3 },
    { userEmail: "user14@example.com", storeName: "Digital Planet", value: 3 },

    // 5. Smart Electronics (9 ratings, Avg: ~4.4 ⭐)
    { userEmail: "user1@example.com", storeName: "Smart Electronics", value: 5 },
    { userEmail: "user4@example.com", storeName: "Smart Electronics", value: 5 },
    { userEmail: "user7@example.com", storeName: "Smart Electronics", value: 5 },
    { userEmail: "user10@example.com", storeName: "Smart Electronics", value: 5 },
    { userEmail: "user13@example.com", storeName: "Smart Electronics", value: 4 },
    { userEmail: "user16@example.com", storeName: "Smart Electronics", value: 4 },
    { userEmail: "user19@example.com", storeName: "Smart Electronics", value: 4 },
    { userEmail: "user20@example.com", storeName: "Smart Electronics", value: 4 },
    { userEmail: "user21@example.com", storeName: "Smart Electronics", value: 4 },

    // 6. Laptop House (6 ratings, Avg: ~4.1 ⭐)
    { userEmail: "user2@example.com", storeName: "Laptop House", value: 5 },
    { userEmail: "user5@example.com", storeName: "Laptop House", value: 5 },
    { userEmail: "user8@example.com", storeName: "Laptop House", value: 4 },
    { userEmail: "user11@example.com", storeName: "Laptop House", value: 4 },
    { userEmail: "user14@example.com", storeName: "Laptop House", value: 4 },
    { userEmail: "user17@example.com", storeName: "Laptop House", value: 3 },

    // 7. Phone Zone (5 ratings, Avg: ~3.7 ⭐)
    { userEmail: "user3@example.com", storeName: "Phone Zone", value: 4 },
    { userEmail: "user6@example.com", storeName: "Phone Zone", value: 4 },
    { userEmail: "user9@example.com", storeName: "Phone Zone", value: 4 },
    { userEmail: "user12@example.com", storeName: "Phone Zone", value: 3 },
    { userEmail: "user15@example.com", storeName: "Phone Zone", value: 3 },

    // 8. Computer World (6 ratings, Avg: ~4.8 ⭐)
    { userEmail: "user16@example.com", storeName: "Computer World", value: 5 },
    { userEmail: "user17@example.com", storeName: "Computer World", value: 5 },
    { userEmail: "user18@example.com", storeName: "Computer World", value: 5 },
    { userEmail: "user19@example.com", storeName: "Computer World", value: 5 },
    { userEmail: "user20@example.com", storeName: "Computer World", value: 5 },
    { userEmail: "user21@example.com", storeName: "Computer World", value: 4 },

    // 9. Electro Mart (3 ratings, Avg: 4.0 ⭐)
    { userEmail: "user20@example.com", storeName: "Electro Mart", value: 4 },
    { userEmail: "user21@example.com", storeName: "Electro Mart", value: 4 },
    { userEmail: "user22@example.com", storeName: "Electro Mart", value: 4 },

    // 10. Future Gadgets (1 rating, Avg: 5.0 ⭐)
    { userEmail: "user22@example.com", storeName: "Future Gadgets", value: 5 },
  ];

  for (const r of ratingsToSeed) {
    const user = users[r.userEmail];
    const store = stores[r.storeName];

    await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId: user.id,
          storeId: store.id,
        },
      },
      update: {
        value: r.value,
      },
      create: {
        userId: user.id,
        storeId: store.id,
        value: r.value,
      },
    });
  }

  console.log(`✅ RATINGS      → 80 Ratings seeded successfully`);
  console.log("\n📊 Seeded Stores Summary:");
  console.log("   • Tech World:       18 ratings (Expected avg: ~4.6 ⭐)");
  console.log("   • Gadget Hub:       11 ratings (Expected avg: ~4.2 ⭐)");
  console.log("   • Mobile Point:     14 ratings (Expected avg: ~4.7 ⭐)");
  console.log("   • Digital Planet:    7 ratings (Expected avg: ~3.9 ⭐)");
  console.log("   • Smart Electronics: 9 ratings (Expected avg: ~4.4 ⭐)");
  console.log("   • Laptop House:      6 ratings (Expected avg: ~4.1 ⭐)");
  console.log("   • Phone Zone:        5 ratings (Expected avg: ~3.7 ⭐)");
  console.log("   • Computer World:    6 ratings (Expected avg: ~4.8 ⭐)");
  console.log("   • Electro Mart:      3 ratings (Expected avg: ~4.0 ⭐)");
  console.log("   • Future Gadgets:    1 rating  (Expected avg: ~5.0 ⭐)");
  console.log("\n🎉 Seed complete! All accounts use password: Test@1234");
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
