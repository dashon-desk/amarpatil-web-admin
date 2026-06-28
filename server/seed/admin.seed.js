require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const tenantsConfig = require("../config/tenants");

const seedAdmin = async () => {
  const args = process.argv.slice(2);
  const tenantId = args[0];
  const customEmail = args[1];
  const customPassword = args[2];

  if (!tenantId) {
    console.error("Error: Please specify a Tenant ID to seed.");
    console.log("\nAvailable Tenant IDs:");
    Object.keys(tenantsConfig).forEach(id => console.log(`  - ${id}`));
    console.log("\nUsage: node seed/admin.seed.js <tenant_id> [admin_email] [admin_password]");
    process.exit(1);
  }

  const tenantConfig = tenantsConfig[tenantId];
  if (!tenantConfig) {
    console.error(`Error: Tenant "${tenantId}" not found in config/tenants.js`);
    process.exit(1);
  }

  const mongodbUri = tenantConfig.MONGODB_URI;
  const email = customEmail || tenantConfig.ADMIN_EMAIL || `admin@${tenantId}.com`;
  const password = customPassword || tenantConfig.ADMIN_PASSWORD || "Dashon@2025";

  console.log(`Connecting to database for tenant [${tenantId}]...`);
  
  try {
    await mongoose.connect(mongodbUri);
    console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);

    const existing = await User.findOne({ email });

    if (existing) {
      console.log(`Admin user with email "${email}" already exists in this database.`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: `${tenantId.charAt(0).toUpperCase() + tenantId.slice(1)} Admin`,
      email,
      password: hashedPassword,
      role: "admin",
      isVerified: true
    });

    console.log(`\nSuccess: Admin created for tenant [${tenantId}]`);
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
