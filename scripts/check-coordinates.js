// Script pour vérifier les coordonnées dans MongoDB
const { MongoClient } = require('mongodb');

async function checkCoordinates() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');
    
    // Récupérer tous les utilisateurs avec leurs coordonnées
    const usersWithCoordinates = await users.find({
      'profile.location.coordinates.lat': { $exists: true },
      'profile.location.coordinates.lng': { $exists: true }
    }, {
      projection: {
        email: 1,
        'profile.firstName': 1,
        'profile.lastName': 1,
        'profile.location.coordinates': 1
      }
    }).toArray();
    
    console.log('Utilisateurs avec coordonnées :');
    usersWithCoordinates.forEach(user => {
      console.log(`${user.profile.firstName} ${user.profile.lastName} (${user.email}):`, 
                  user.profile.location.coordinates);
    });
    
  } finally {
    await client.close();
  }
}

checkCoordinates().catch(console.error);