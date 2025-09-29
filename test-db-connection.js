const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = "mongodb+srv://postsm49_db_user:nIGtWRD9r4m98M0c@cluster0.cmltzm1.mongodb.net/agri-she";
  
  try {
    console.log('Attempting to connect to MongoDB...');
    const client = new MongoClient(uri);
    await client.connect();
    
    console.log('✅ Connected successfully to MongoDB');
    
    const db = client.db('agri-she');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));
    
    // Count users
    const usersCount = await db.collection('users').countDocuments();
    console.log('👥 Users count:', usersCount);
    
    // Get first few users
    const users = await db.collection('users').find({}).limit(3).toArray();
    console.log('👤 Sample users:', users.map(u => ({ _id: u._id, email: u.email, role: u.role })));
    
    await client.close();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();