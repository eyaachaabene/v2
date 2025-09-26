const { MongoClient } = require("mongodb");

async function testDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://postsm49_db_user:nIGtWRD9r4m98M0c@cluster0.cmltzm1.mongodb.net/agri-she";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("agri-she");

    // Test collections
    const collections = ["users", "products", "iot_sensors", "sensor_readings", "opportunities"];
    
    for (const collection of collections) {
      const count = await db.collection(collection).countDocuments();
      const sample = await db.collection(collection).findOne();
      console.log(`\n📊 ${collection} collection:`);
      console.log(`   Documents count: ${count}`);
      console.log(`   Sample document:`, JSON.stringify(sample, null, 2));
    }

  } catch (error) {
    console.error("❌ Database error:", error);
  } finally {
    await client.close();
  }
}

testDatabase().catch(console.error);