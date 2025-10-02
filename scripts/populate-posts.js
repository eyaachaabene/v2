const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb+srv://postsm49_db_user:nIGtWRD9r4m98M0c@cluster0.cmltzm1.mongodb.net/agri-she";

const samplePosts = [
  {
    author: new ObjectId(),
    content: "Just harvested my first batch of olives this season! The IoT sensors helped me optimize watering, and the yield is 20% higher than last year. Happy to share my irrigation schedule with fellow olive growers.",
    tags: ["Olives", "IoT", "Harvest"],
    category: "Success Story",
    images: ["/olive-harvest.jpg"],
    visibility: "public",
    likes: [],
    comments: [],
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    author: new ObjectId(),
    content: "Has anyone dealt with aphids on tomato plants this season? I'm seeing some early signs and want to use organic methods. What has worked for you?",
    tags: ["Tomatoes", "Pest Control", "Organic"],
    category: "Question",
    images: [],
    visibility: "public",
    likes: [],
    comments: [],
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
  },
  {
    author: new ObjectId(),
    content: "Sharing my grandmother's traditional wheat storage method that keeps grain fresh for months without chemicals. This technique has been in our family for generations.",
    tags: ["Wheat", "Traditional", "Storage"],
    category: "Knowledge Sharing",
    images: ["/wheat-storage.jpg"],
    visibility: "public",
    likes: [],
    comments: [],
    isActive: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    author: new ObjectId(),
    content: "Weather forecast shows heavy rain next week. Fellow citrus farmers, make sure to check your drainage systems! I learned this the hard way last season.",
    tags: ["Citrus", "Weather", "Prevention"],
    category: "Weather Alert",
    images: [],
    visibility: "public",
    likes: [],
    comments: [],
    isActive: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
  }
];

async function populatePosts() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('agri-she');
    const collection = db.collection('posts');
    
    // Clear existing posts
    await collection.deleteMany({});
    console.log('Cleared existing posts');
    
    // Insert sample posts
    const result = await collection.insertMany(samplePosts);
    console.log(`Inserted ${result.insertedCount} sample posts`);
    
    console.log('Sample posts populated successfully!');
    
  } catch (error) {
    console.error('Error populating posts:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

populatePosts();