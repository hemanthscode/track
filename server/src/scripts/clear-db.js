import mongoose from "mongoose";
import { config } from "../config/env.js";
import logger from "../utils/logger.js";
import { User, Transaction, Budget } from "../models/index.js";

const clearDatabase = async () => {
  try {
    console.log("\n🧹 CLEARING DATABASE...");
    console.log("=".repeat(50));

    // Connect
    await mongoose.connect(config.database.uri);
    console.log("✅ Connected to MongoDB");

    // Get collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections`);

    // Delete all data
    const deletePromises = [];
    
    // Main models
    const models = [User, Transaction, Budget];
    for (const Model of models) {
      console.log(`🗑️  Clearing ${Model.collection.name}...`);
      deletePromises.push(Model.deleteMany({}));
    }

    // All other collections (logs, sessions, etc.)
    for (const collection of collections) {
      const modelName = collection.name.charAt(0).toUpperCase() + collection.name.slice(1);
      if (!models.some(m => m.collection.name === collection.name)) {
        console.log(`🗑️  Clearing ${collection.name}...`);
        deletePromises.push(
          mongoose.connection.db.collection(collection.name).deleteMany({})
        );
      }
    }

    // Execute all deletes
    const results = await Promise.allSettled(deletePromises);
    const deleted = results.filter(r => r.status === 'fulfilled').length;
    const errors = results.filter(r => r.status === 'rejected');

    console.log("\n📊 RESULTS:");
    console.log(`✅ Successfully cleared: ${deleted} collections`);
    if (errors.length > 0) {
      console.log(`❌ Errors: ${errors.length}`);
      errors.forEach((err, i) => console.log(`   ${i+1}. ${err.reason?.message || err.reason}`));
    }

    // Close
    await mongoose.connection.close();
    console.log("\n🎉 Database cleared successfully!");
    console.log("\n🔄 Ready for fresh seed: npm run seed");
    
  } catch (error) {
    console.error("💥 Clear failed:", error.message);
    process.exit(1);
  }
}

clearDatabase();
