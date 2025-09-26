import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb+srv://postsm49_db_user:nIGtWRD9r4m98M0c@cluster0.cmltzm1.mongodb.net/"
const dbName = "agri-she"

async function populateSampleData() {
  const client = new MongoClient(uri)

  try {
    console.log("Connecting to MongoDB Atlas...")
    await client.connect()
    console.log("✅ Connected to MongoDB Atlas")

    const db = client.db(dbName)

    // Sample sensor readings
    console.log("Adding sample sensor readings...")
    const sensorReadings = [
      {
        sensorId: "TEMP_001",
        farmerId: "farmer1",
        type: "temperature",
        value: 25.5,
        unit: "°C",
        timestamp: new Date(),
        location: { lat: 36.8065, lng: 10.1815 },
      },
      {
        sensorId: "HUMID_001",
        farmerId: "farmer1",
        type: "humidity",
        value: 65.2,
        unit: "%",
        timestamp: new Date(),
        location: { lat: 36.8065, lng: 10.1815 },
      },
    ]
    await db.collection("sensor_readings").insertMany(sensorReadings)

    // Sample orders
    console.log("Adding sample orders...")
    const orders = [
      {
        orderId: "ORD_001",
        buyerId: "buyer1",
        farmerId: "farmer1",
        productId: "prod1",
        quantity: 10,
        totalAmount: 50.0,
        status: "pending",
        createdAt: new Date(),
        deliveryAddress: {
          street: "123 Main St",
          city: "Tunis",
          governorate: "Tunis",
        },
      },
    ]
    await db.collection("orders").insertMany(orders)

    // Sample learning modules
    console.log("Adding sample learning modules...")
    const learningModules = [
      {
        title: "Organic Farming Basics",
        description: "Learn the fundamentals of organic farming",
        category: "farming_techniques",
        difficulty: "beginner",
        duration: 120,
        content: {
          videos: ["intro.mp4"],
          documents: ["guide.pdf"],
          quizzes: [],
        },
        ratings: {
          averageRating: 4.5,
          totalRatings: 25,
        },
        createdAt: new Date(),
      },
    ]
    await db.collection("learning_modules").insertMany(learningModules)

    // Sample opportunities
    console.log("Adding sample opportunities...")
    const opportunities = [
      {
        title: "Agricultural Grant Program 2024",
        description: "Government funding for sustainable farming projects",
        type: "grant",
        provider: "Ministry of Agriculture",
        amount: 5000,
        currency: "TND",
        deadline: new Date("2024-12-31"),
        status: "active",
        location: {
          governorate: "Tunis",
          delegation: "All",
        },
        requirements: ["Must be registered farmer", "Sustainable farming plan required"],
        createdAt: new Date(),
      },
    ]
    await db.collection("opportunities").insertMany(opportunities)

    console.log("\n🎉 Sample data populated successfully!")
    console.log("📊 All 7 collections should now be visible in your database:")
    console.log("   1. users")
    console.log("   2. products")
    console.log("   3. iot_sensors")
    console.log("   4. sensor_readings ✨ NEW")
    console.log("   5. orders ✨ NEW")
    console.log("   6. learning_modules ✨ NEW")
    console.log("   7. opportunities ✨ NEW")
  } catch (error) {
    console.error("❌ Error populating sample data:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("🔌 Database connection closed")
  }
}

// Run the population script
populateSampleData().catch(console.error)
