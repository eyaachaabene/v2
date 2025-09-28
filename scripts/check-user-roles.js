// Script pour vérifier les rôles utilisateur dans MongoDB
const { MongoClient } = require('mongodb');

async function checkUserRoles() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');
    
    // Récupérer les utilisateurs par rôle
    const roleStats = await users.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          users: { 
            $push: {
              email: "$email",
              firstName: "$profile.firstName",
              lastName: "$profile.lastName"
            }
          }
        }
      }
    ]).toArray();
    
    console.log('Statistiques des rôles utilisateur :');
    roleStats.forEach(stat => {
      console.log(`\n${stat._id.toUpperCase()}: ${stat.count} utilisateur(s)`);
      stat.users.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.email})`);
      });
    });
    
  } finally {
    await client.close();
  }
}

checkUserRoles().catch(console.error);