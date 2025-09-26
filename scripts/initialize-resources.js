const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://postsm49_db_user:nIGtWRD9r4m98M0c@cluster0.cmltzm1.mongodb.net/agri-she';

async function initializeDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('agri-she');
    
    // Create resources collection if it doesn't exist
    try {
      await db.createCollection('resources');
      console.log('Created resources collection');
    } catch (e) {
      if (e.code === 48) { // Collection already exists
        console.log('Resources collection already exists');
      } else {
        throw e;
      }
    }

    // Create indexes
    const resourcesCollection = db.collection('resources');
    
    await resourcesCollection.createIndexes([
      { key: { supplierId: 1 }, name: 'supplierId_1' },
      { key: { category: 1 }, name: 'category_1' },
      { key: { type: 1 }, name: 'type_1' },
      { key: { 'location.governorate': 1 }, name: 'location.governorate_1' },
      { key: { 'availability.status': 1 }, name: 'availability.status_1' },
      { key: { 'ratings.averageRating': -1 }, name: 'ratings.averageRating_-1' },
      { key: { createdAt: -1 }, name: 'createdAt_-1' },
      { key: { isActive: 1 }, name: 'isActive_1' },
      { key: { name: 'text', description: 'text', tags: 'text' }, name: 'text_search' }
    ]);

    console.log('Created indexes for resources collection');

    // Create sample supplier user if not exists
    const usersCollection = db.collection('users');
    const supplier = await usersCollection.findOne({ email: 'supplier@agrishe.com' });
    
    if (!supplier) {
      await usersCollection.insertOne({
        email: 'supplier@agrishe.com',
        password: '$2b$10$YourHashedPasswordHere', // Remember to use proper password hashing
        role: 'supplier',
        profile: {
          firstName: 'Agri',
          lastName: 'Supplier',
          phone: '+216 99 999 999',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      });
      console.log('Created supplier user');
    }

    console.log('Database initialization completed successfully');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

initializeDatabase().catch(console.error);