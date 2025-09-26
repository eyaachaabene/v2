import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb+srv://postsm49_db_user:nIGtWRD9r4m98M0c@cluster0.cmltzm1.mongodb.net/"
const dbName = "agri-she"

async function setupDatabase() {
  const client = new MongoClient(uri)

  try {
    console.log("Connecting to MongoDB Atlas...")
    await client.connect()
    console.log("✅ Connected to MongoDB Atlas")

    const db = client.db(dbName)

    // Test connection
    await db.admin().ping()
    console.log("✅ Database connection verified")

    // Create indexes for better performance
    console.log("Creating indexes...")

    // Users Collection Indexes
    try {
      await db.collection("users").createIndex({ email: 1 }, { unique: true })
      await db.collection("users").createIndex({ role: 1 })
      await db.collection("users").createIndex({ "profile.location.governorate": 1 })
      await db.collection("users").createIndex({ "farmerProfile.specializations": 1 })
      console.log("✅ Users collection indexes created")
    } catch (error) {
      console.log("⚠️  Users indexes already exist or error:", error.message)
    }

    // Products Collection Indexes
    try {
      await db.collection("products").createIndex({ farmerId: 1 })
      await db.collection("products").createIndex({ category: 1 })
      await db.collection("products").createIndex({ subcategory: 1 })
      await db.collection("products").createIndex({ "availability.status": 1 })
      await db.collection("products").createIndex({ "availability.quantity": 1 })
      await db.collection("products").createIndex({ "pricing.price": 1 })
      await db.collection("products").createIndex({ "ratings.averageRating": -1 })
      await db.collection("products").createIndex({ createdAt: -1 })
      await db.collection("products").createIndex({ isActive: 1 })
      await db.collection("products").createIndex({ tags: 1 })
      await db.collection("products").createIndex({ "location.governorate": 1 })
      await db.collection("products").createIndex({ "location.city": 1 })
      console.log("✅ Products collection indexes created")
    } catch (error) {
      console.log("⚠️  Products indexes already exist or error:", error.message)
    }

    // IoT Sensors Collection Indexes
    try {
      await db.collection("iot_sensors").createIndex({ farmerId: 1 })
      await db.collection("iot_sensors").createIndex({ sensorId: 1 }, { unique: true })
      await db.collection("iot_sensors").createIndex({ status: 1 })
      console.log("✅ IoT Sensors collection indexes created")
    } catch (error) {
      console.log("⚠️  IoT Sensors indexes already exist or error:", error.message)
    }

    // Sensor Readings Collection Indexes
    try {
      await db.collection("sensor_readings").createIndex({ sensorId: 1, timestamp: -1 })
      await db.collection("sensor_readings").createIndex({ farmerId: 1, timestamp: -1 })
      await db.collection("sensor_readings").createIndex({ timestamp: -1 })
      console.log("✅ Sensor Readings collection indexes created")
    } catch (error) {
      console.log("⚠️  Sensor Readings indexes already exist or error:", error.message)
    }

    // Orders Collection Indexes
    try {
      await db.collection("orders").createIndex({ buyerId: 1 })
      await db.collection("orders").createIndex({ farmerId: 1 })
      await db.collection("orders").createIndex({ status: 1 })
      await db.collection("orders").createIndex({ createdAt: -1 })
      console.log("✅ Orders collection indexes created")
    } catch (error) {
      console.log("⚠️  Orders indexes already exist or error:", error.message)
    }

    // Learning Modules Collection Indexes
    try {
      await db.collection("learning_modules").createIndex({ category: 1 })
      await db.collection("learning_modules").createIndex({ difficulty: 1 })
      await db.collection("learning_modules").createIndex({ "ratings.averageRating": -1 })
      console.log("✅ Learning Modules collection indexes created")
    } catch (error) {
      console.log("⚠️  Learning Modules indexes already exist or error:", error.message)
    }

    // Opportunities Collection Indexes
    try {
      await db.collection("opportunities").createIndex({ type: 1 })
      await db.collection("opportunities").createIndex({ status: 1 })
      await db.collection("opportunities").createIndex({ "location.governorate": 1 })
      await db.collection("opportunities").createIndex({ deadline: 1 })
      console.log("✅ Opportunities collection indexes created")
    } catch (error) {
      console.log("⚠️  Opportunities indexes already exist or error:", error.message)
    }

    console.log("\n🎉 Database setup completed successfully!")
    console.log(`📊 Database: ${dbName}`)
    console.log(
      "📁 Collections ready: users, products, iot_sensors, sensor_readings, orders, learning_modules, opportunities",
    )
    console.log("⚡ Indexes created for optimal performance")
  } catch (error) {
    console.error("❌ Database setup error:", error)
    process.exit(1)
  }
}

// Run the setup
setupDatabase().catch(console.error)
