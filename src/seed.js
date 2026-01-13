import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "./models/User.js";
import Lead from "./models/Lead.js";
import Account from "./models/Account.js";
import Deal from "./models/Deal.js";
import DealNote from "./models/dealNote.model.js";
import DealTask from "./models/DealTask.js";

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function run() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI missing in env");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("✅ Mongo connected");

  // clean (safe for demo db only)
  await Promise.all([
    User.deleteMany({}),
    Lead.deleteMany({}),
    Account.deleteMany({}),
    Deal.deleteMany({}),
    DealNote.deleteMany({}),
    DealTask.deleteMany({}),
  ]);

  console.log("🧹 Cleared collections");

  // users
  const passwordHash = await bcrypt.hash("Demo@123", 10);

 const users = await User.insertMany([
  { name: "Demo Admin", email: "demo.admin@crm.com", passwordHash, role: "ADMIN" },
  { name: "Demo Sales", email: "demo.sales@crm.com", passwordHash, role: "SALES" },
  { name: "Demo Manager", email: "demo.manager@crm.com", passwordHash, role: "MANAGER" },
]);


  const [admin, sales, manager] = users;

  console.log("✅ Users seeded:", users.map((u) => u.email).join(", "));

  // accounts
  const accounts = await Account.insertMany([
    { companyName: "Adani Green Energy Ltd", gst: "27ABCDE1234F1Z5", industry: "Power", owner: admin._id },
    { companyName: "Adani Green Infra", gst: "27QWERT1234F1Z5", industry: "EPC", owner: sales._id },
    { companyName: "NTPC Limited", gst: "09NTPCX1234F1Z1", industry: "Power", owner: manager._id },
    { companyName: "PowerGrid Corporation", gst: "07PGCIL1234F1Z9", industry: "Power", owner: admin._id },
    { companyName: "Indian Oil Corporation", gst: "06IOCLX1234F1Z2", industry: "Oil & Gas", owner: sales._id },
    { companyName: "SAEL Industries Ltd", gst: "08SAELX1234F1Z7", industry: "EPC", owner: manager._id },
  ]);

  // set a parent example
  await Account.findByIdAndUpdate(accounts[1]._id, { parentAccount: accounts[0]._id });

  console.log("✅ Accounts seeded:", accounts.length);

  // leads
  const leadStatuses = ["NEW", "CONTACTED", "QUALIFIED", "LOST"];
  const leads = await Lead.insertMany(
    Array.from({ length: 12 }).map((_, i) => ({
      firstName: `Lead${i + 1}`,
      lastName: "User",
      company: pick(accounts).companyName,
      email: `lead${i + 1}@example.com`,
      phone: `98${String(10000000 + i).slice(0, 8)}`,
      status: pick(leadStatuses),
      owner: pick([admin._id, sales._id, manager._id]),
    }))
  );

  console.log("✅ Leads seeded:", leads.length);

  // deals
  const stages = ["NEW", "QUALIFIED", "PROPOSAL", "WON", "LOST"];
  const dealTitles = [
    "HT Cable Supply",
    "LT Cable Order",
    "EPC Tender",
    "Solar Plant Cable Requirement",
    "Substation Package",
    "Railway Signalling Cable",
  ];

  const deals = await Deal.insertMany(
    Array.from({ length: 10 }).map((_, i) => ({
      name: `${pick(dealTitles)} #${i + 1}`,
      title: `${pick(dealTitles)} #${i + 1}`, // supports either field
      stage: pick(stages),
      amount: pick([500000, 2500000, 12000000, 45000000, 9000000]),
      account: pick(accounts)._id,
      owner: pick([admin._id, sales._id, manager._id]),
      closeDate: new Date(Date.now() + pick([7, 15, 30, 45]) * 24 * 60 * 60 * 1000),
      description: "Demo deal created by seed script for dashboard and pipeline.",
    }))
  );

  console.log("✅ Deals seeded:", deals.length);

  // notes
  const notes = await DealNote.insertMany(
    Array.from({ length: 12 }).map((_, i) => ({
      deal: pick(deals)._id,
      body: `Demo note ${i + 1}: Follow up discussion and next steps.`,
      createdBy: pick([admin._id, sales._id, manager._id]),
    }))
  );

  console.log("✅ Notes seeded:", notes.length);

  // tasks
  const priorities = ["LOW", "MEDIUM", "HIGH"];
  const tasks = await DealTask.insertMany(
    Array.from({ length: 12 }).map((_, i) => {
      const due = new Date(Date.now() + pick([-3, -1, 0, 2, 5, 8]) * 24 * 60 * 60 * 1000);
      return {
        deal: pick(deals)._id,
        title: `Demo task ${i + 1}: Follow up call`,
        dueDate: due,
        status: pick(["OPEN", "DONE"]),
        priority: pick(priorities),
        assignee: pick([admin._id, sales._id, manager._id]),
        createdBy: pick([admin._id, sales._id, manager._id]),
      };
    })
  );

  console.log("✅ Tasks seeded:", tasks.length);

  console.log("\n✅ SEED COMPLETE");
  console.log("Demo login:");
  console.log(" - demo.admin@crm.com / Demo@123");
  console.log(" - demo.sales@crm.com / Demo@123");
  console.log(" - demo.manager@crm.com / Demo@123");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
