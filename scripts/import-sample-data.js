const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");

const uri = process.env.MONGODB_URI || "mongodb+srv://postsm49_db_user:nIGtWRD9r4m98M0c@cluster0.cmltzm1.mongodb.net/";
const dbName = "agri-she";

async function importSampleData() {
  const client = new MongoClient(uri);

  try {
    console.log("Connecting to MongoDB Atlas...");
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db(dbName);

    // Import each collection's data
    const collections = ["users", "products", "iot_sensors", "sensor_readings", "opportunities"];

    for (const collection of collections) {
      try {
        const data = JSON.parse(
          fs.readFileSync(
            path.join(__dirname, "sample-data", `${collection}.json`),
            "utf8"
          )
        );

        // Delete existing data
        await db.collection(collection).deleteMany({});
        
        // Get the array of documents
        const documents = data[collection];
        
        // Insert each document individually
        for (const doc of documents) {
          // Convert MongoDB Extended JSON format to actual values
          if (doc._id && doc._id.$oid) {
            doc._id = new ObjectId(doc._id.$oid);
          }
          if (doc.farmerId && doc.farmerId.$oid) {
            doc.farmerId = new ObjectId(doc.farmerId.$oid);
          }
          if (doc.availability) {
            if (doc.availability.harvestDate && doc.availability.harvestDate.$date) {
              doc.availability.harvestDate = new Date(doc.availability.harvestDate.$date);
            }
            if (doc.availability.expiryDate && doc.availability.expiryDate.$date) {
              doc.availability.expiryDate = new Date(doc.availability.expiryDate.$date);
            }
          }
          if (doc.createdAt && doc.createdAt.$date) {
            doc.createdAt = new Date(doc.createdAt.$date);
          }
          if (doc.updatedAt && doc.updatedAt.$date) {
            doc.updatedAt = new Date(doc.updatedAt.$date);
          }
          
          await db.collection(collection).insertOne(doc);
        }
        
        console.log(`✅ ${collection} data imported:`, documents.length, "documents");
      } catch (error) {
        console.error(`❌ Error importing ${collection}:`, error);
      }
    }

    console.log("\n🎉 Sample data import completed!");

  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run the import
importSampleData().catch(console.error);