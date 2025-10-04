/**
 * Initialize Sample Opportunities Data
 * Run this script to populate the database with sample opportunities
 * 
 * Usage: node scripts/initialize-opportunities.js
 */

const { MongoClient, ObjectId } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agrishe'

const sampleOpportunities = [
  {
    title: "Help with Olive Harvest",
    description: "Looking for experienced workers to help with olive harvest season. Must be available for 2-3 weeks. Physical work required, no prior experience necessary but preferred. We provide all equipment and transportation from central meeting point.",
    type: "seasonal_work",
    jobType: "Seasonal Work",
    urgency: "urgent",
    postedByType: "farmer",
    location: {
      governorate: "Sfax",
      city: "Sfax",
      address: "Olive Farm, Route de Tunis"
    },
    compensation: {
      type: "daily",
      amount: 25,
      currency: "TND",
      payRate: "25 TND/day",
      benefits: ["Transportation", "Meals provided"]
    },
    duration: {
      type: "weeks",
      value: 3,
      description: "2-3 weeks"
    },
    positions: {
      available: 15,
      filled: 0
    },
    requirements: {
      skills: ["Harvesting", "Physical Work", "Agriculture"],
      experienceLevel: "entry",
      experienceYears: 0
    },
    contactInfo: {
      name: "Amina Ben Salem",
      email: "amina.bensalem@example.com",
      phone: "+216 98 123 456",
      preferredContact: "phone"
    },
    startDate: new Date('2025-11-01'),
    endDate: new Date('2025-11-20'),
    applicationDeadline: new Date('2025-10-25'),
    currentApplicants: 0,
    applicantIds: [],
    viewCount: 0,
    saveCount: 0,
    status: "active",
    featured: false,
    urgent: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Seasonal Tomato Picking",
    description: "Need reliable workers for tomato harvest. Experience with greenhouse farming preferred. Must be available during harvest season. Competitive pay and good working conditions.",
    type: "seasonal_work",
    jobType: "Seasonal Work",
    urgency: "normal",
    postedByType: "farmer",
    location: {
      governorate: "Bizerte",
      city: "Bizerte",
      address: "Greenhouse Farm Complex"
    },
    compensation: {
      type: "daily",
      amount: 30,
      currency: "TND",
      payRate: "30 TND/day",
      benefits: ["Bonus on productivity", "Meals"]
    },
    duration: {
      type: "months",
      value: 1,
      description: "1 month"
    },
    positions: {
      available: 10,
      filled: 0
    },
    requirements: {
      skills: ["Harvesting", "Greenhouse", "Quality Control"],
      experienceLevel: "intermediate",
      experienceYears: 1
    },
    contactInfo: {
      name: "Fatma Khelifi",
      email: "fatma.khelifi@example.com",
      phone: "+216 97 234 567"
    },
    startDate: new Date('2025-11-15'),
    maxApplicants: 20,
    currentApplicants: 0,
    applicantIds: [],
    viewCount: 0,
    saveCount: 0,
    status: "active",
    featured: false,
    urgent: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    updatedAt: new Date()
  },
  {
    title: "Modern Farming Techniques Training",
    description: "Free training program on sustainable farming practices, irrigation management, and crop rotation. Certificate provided upon completion. Limited spots available!",
    type: "training",
    jobType: "Training",
    urgency: "normal",
    postedByType: "ngo",
    location: {
      governorate: "Tunis",
      city: "Tunis",
      address: "Agricultural Development Center"
    },
    compensation: {
      type: "certificate",
      payRate: "Free + Certificate",
      benefits: ["Certificate", "Materials included", "Refreshments"]
    },
    duration: {
      type: "days",
      value: 3,
      description: "3 days"
    },
    positions: {
      available: 30,
      filled: 0
    },
    requirements: {
      skills: ["Learning", "Sustainability", "Irrigation"],
      experienceLevel: "entry"
    },
    contactInfo: {
      name: "Agricultural Development NGO",
      email: "training@agringoorg",
      phone: "+216 71 123 456"
    },
    startDate: new Date('2025-10-20'),
    applicationDeadline: new Date('2025-10-15'),
    maxApplicants: 30,
    currentApplicants: 0,
    applicantIds: [],
    viewCount: 0,
    saveCount: 0,
    status: "active",
    featured: true,
    urgent: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date()
  },
  {
    title: "Organic Vegetable Farm Assistant",
    description: "Part-time position helping with organic vegetable production. Great opportunity for learning sustainable practices. Flexible hours, ideal for students or those seeking part-time work.",
    type: "part_time",
    jobType: "Part-time",
    urgency: "low_priority",
    postedByType: "farmer",
    location: {
      governorate: "Kairouan",
      city: "Kairouan",
      address: "Green Valley Organic Farm"
    },
    compensation: {
      type: "monthly",
      amount: 800,
      currency: "TND",
      payRate: "800 TND/month"
    },
    duration: {
      type: "months",
      value: 6,
      description: "6 months"
    },
    positions: {
      available: 2,
      filled: 0
    },
    requirements: {
      skills: ["Organic Farming", "Vegetables", "Sustainability"],
      experienceLevel: "entry"
    },
    contactInfo: {
      name: "Green Valley Farm",
      email: "contact@greenvalley.tn",
      phone: "+216 95 345 678"
    },
    startDate: new Date('2025-11-01'),
    endDate: new Date('2026-05-01'),
    currentApplicants: 0,
    applicantIds: [],
    viewCount: 0,
    saveCount: 0,
    status: "active",
    featured: false,
    urgent: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date()
  },
  {
    title: "Smart Irrigation System Installation",
    description: "Help needed to install IoT irrigation systems across multiple farms. Technical training will be provided. Great opportunity to learn about agricultural technology and IoT systems.",
    type: "technical_work",
    jobType: "Contract",
    urgency: "normal",
    postedByType: "partner",
    location: {
      governorate: "Monastir",
      city: "Monastir",
      address: "Various farm locations"
    },
    compensation: {
      type: "daily",
      amount: 40,
      currency: "TND",
      payRate: "40 TND/day",
      benefits: ["Technical training", "Certification"]
    },
    duration: {
      type: "weeks",
      value: 2,
      description: "2 weeks"
    },
    positions: {
      available: 5,
      filled: 0
    },
    requirements: {
      skills: ["Technical", "IoT", "Installation"],
      experienceLevel: "intermediate",
      education: "Technical background preferred"
    },
    contactInfo: {
      name: "AgriTech Solutions",
      email: "jobs@agritech.tn",
      phone: "+216 96 456 789"
    },
    startDate: new Date('2025-10-25'),
    currentApplicants: 0,
    applicantIds: [],
    viewCount: 0,
    saveCount: 0,
    status: "active",
    featured: false,
    urgent: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    updatedAt: new Date()
  },
  {
    title: "Women's Cooperative Leadership Workshop",
    description: "Leadership and business skills workshop specifically designed for women in agriculture. Learn business planning, financial management, and cooperative management. Networking opportunity with successful women farmers.",
    type: "workshop",
    jobType: "Training",
    urgency: "normal",
    postedByType: "ngo",
    location: {
      governorate: "Sousse",
      city: "Sousse",
      address: "Women's Development Center"
    },
    compensation: {
      type: "free",
      payRate: "Free + Networking",
      benefits: ["Certificate", "Networking", "Business plan template", "Meals"]
    },
    duration: {
      type: "days",
      value: 2,
      description: "2 days"
    },
    positions: {
      available: 25,
      filled: 0
    },
    requirements: {
      skills: ["Leadership", "Business", "Networking"],
      experienceLevel: "entry"
    },
    contactInfo: {
      name: "UN Women Tunisia",
      email: "unwomen@tunisia.org",
      phone: "+216 73 234 567"
    },
    startDate: new Date('2025-10-18'),
    applicationDeadline: new Date('2025-10-12'),
    maxApplicants: 25,
    currentApplicants: 0,
    applicantIds: [],
    viewCount: 0,
    saveCount: 0,
    status: "active",
    featured: true,
    urgent: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date()
  }
]

async function initializeOpportunities() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('✓ Connected to MongoDB')

    const db = client.db()
    
    // Create sample users if they don't exist
    const usersCollection = db.collection('users')
    const opportunitiesCollection = db.collection('opportunities')

    // Check if we already have opportunities
    const count = await opportunitiesCollection.countDocuments()
    if (count > 0) {
      console.log(`⚠️  Database already has ${count} opportunities`)
      const answer = await askQuestion('Do you want to add more sample data? (yes/no): ')
      if (answer.toLowerCase() !== 'yes') {
        console.log('Skipping initialization')
        return
      }
    }

    // Find or create sample users
    const sampleUsers = await Promise.all([
      usersCollection.findOne({ email: 'amina.farmer@example.com' }),
      usersCollection.findOne({ email: 'fatma.farmer@example.com' }),
      usersCollection.findOne({ email: 'ngo@example.com' }),
    ])

    // If users don't exist, create them
    const userIds = []
    for (let i = 0; i < 3; i++) {
      if (sampleUsers[i]) {
        userIds.push(sampleUsers[i]._id)
      } else {
        const result = await usersCollection.insertOne({
          email: i === 0 ? 'amina.farmer@example.com' : 
                 i === 1 ? 'fatma.farmer@example.com' : 
                 'ngo@example.com',
          password: '$2a$10$dummyhashfordemopurposes', // In production, properly hash
          role: i < 2 ? 'farmer' : 'ngo',
          profile: {
            firstName: i === 0 ? 'Amina' : i === 1 ? 'Fatma' : 'NGO',
            lastName: i === 0 ? 'Ben Salem' : i === 1 ? 'Khelifi' : 'Organization',
            phone: `+216 9${i} 123 456`
          },
          createdAt: new Date(),
          updatedAt: new Date()
        })
        userIds.push(result.insertedId)
      }
    }

    // Assign user IDs to opportunities
    sampleOpportunities.forEach((opp, index) => {
      const userIndex = index % 3
      opp.postedBy = userIds[userIndex]
      opp.postedByName = index % 3 === 0 ? 'Amina Ben Salem' : 
                          index % 3 === 1 ? 'Fatma Khelifi' : 
                          'NGO Organization'
    })

    // Insert opportunities
    const result = await opportunitiesCollection.insertMany(sampleOpportunities)
    console.log(`✓ Inserted ${result.insertedCount} sample opportunities`)

    // Create indexes
    console.log('Creating indexes...')
    
    await opportunitiesCollection.createIndex({ status: 1, featured: -1, urgent: -1, createdAt: -1 })
    await opportunitiesCollection.createIndex({ "location.governorate": 1 })
    await opportunitiesCollection.createIndex({ type: 1 })
    await opportunitiesCollection.createIndex({ postedBy: 1 })
    await opportunitiesCollection.createIndex({ 
      title: "text", 
      description: "text", 
      "requirements.skills": "text" 
    })
    
    console.log('✓ Created indexes')

    console.log('\n✅ Initialization complete!')
    console.log('\nSample opportunities created:')
    sampleOpportunities.forEach((opp, i) => {
      console.log(`${i + 1}. ${opp.title} (${opp.location.governorate})`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
    console.log('\n✓ Connection closed')
  }
}

function askQuestion(question) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      readline.close()
      resolve(answer)
    })
  })
}

// Run the initialization
initializeOpportunities()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
