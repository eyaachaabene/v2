const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://postsm49_db_user:nIGtWRD9r4m98M0c@cluster0.cmltzm1.mongodb.net/agri-she';
const client = new MongoClient(uri);

const sampleResources = [
  {
    name: "Professional Pruning Shears",
    description: "High-quality bypass pruning shears for precise cuts. Perfect for vineyard maintenance and fruit tree pruning.",
    category: "Tools",
    type: "Hand Tools",
    images: [
      "/tools/pruning-shears-1.jpg",
      "/tools/pruning-shears-2.jpg"
    ],
    pricing: {
      price: 45.99,
      unit: "piece",
      currency: "TND",
      minimumOrder: 1,
      bulkDiscounts: [
        {
          quantity: 5,
          discountPercentage: 10
        }
      ]
    },
    specifications: {
      brand: "GardenPro",
      model: "GP-PS200",
      manufacturer: "GardenPro Tools",
      weight: 0.25,
      dimensions: {
        length: 20,
        width: 5,
        height: 2,
        unit: "cm"
      },
      certifications: ["ISO-9001"]
    },
    availability: {
      status: "In Stock",
      quantity: 50,
      leadTime: "2-3 days",
      shippingInfo: {
        methods: ["Standard Delivery", "Express Delivery"],
        costs: {
          standard: 7,
          express: 15
        }
      }
    },
    location: {
      governorate: "Tunis",
      city: "Tunis City",
      coordinates: {
        lat: 36.8065,
        lng: 10.1815
      }
    },
    ratings: {
      averageRating: 4.5,
      totalReviews: 28,
      ratingDistribution: {
        5: 15,
        4: 10,
        3: 2,
        2: 1,
        1: 0
      }
    },
    tags: ["Pruning", "Hand Tools", "Professional", "Gardening"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Organic Pest Control Solution",
    description: "Natural and eco-friendly pest control solution safe for organic farming. Effective against common crop pests.",
    category: "Pesticides",
    type: "Organic Pesticides",
    images: [
      "/pesticides/organic-solution-1.jpg",
      "/pesticides/organic-solution-2.jpg"
    ],
    pricing: {
      price: 29.99,
      unit: "L",
      currency: "TND",
      minimumOrder: 2,
      bulkDiscounts: [
        {
          quantity: 10,
          discountPercentage: 15
        }
      ]
    },
    specifications: {
      brand: "EcoFarm",
      model: "OF-PC100",
      manufacturer: "EcoFarm Solutions",
      activeIngredients: ["Neem Oil", "Pyrethrin"],
      composition: {
        neemOil: "70%",
        pyrethrin: "20%",
        other: "10%"
      },
      applicationMethod: "Spray",
      safetyPeriod: "4 hours",
      certifications: ["Organic Certified", "Eco-Friendly"]
    },
    availability: {
      status: "In Stock",
      quantity: 100,
      leadTime: "1-2 days",
      shippingInfo: {
        methods: ["Standard Delivery"],
        costs: {
          standard: 10
        }
      }
    },
    location: {
      governorate: "Sfax",
      city: "Sfax City",
      coordinates: {
        lat: 34.7406,
        lng: 10.7603
      }
    },
    ratings: {
      averageRating: 4.8,
      totalReviews: 45,
      ratingDistribution: {
        5: 38,
        4: 5,
        3: 2,
        2: 0,
        1: 0
      }
    },
    tags: ["Organic", "Pest Control", "Eco-Friendly", "Natural"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Drip Irrigation Kit",
    description: "Complete drip irrigation system kit for efficient water usage. Includes tubing, drippers, filters, and connectors.",
    category: "Irrigation Equipment",
    type: "Irrigation Systems",
    images: [
      "/irrigation/drip-kit-1.jpg",
      "/irrigation/drip-kit-2.jpg"
    ],
    pricing: {
      price: 199.99,
      unit: "kit",
      currency: "TND",
      minimumOrder: 1,
      bulkDiscounts: [
        {
          quantity: 3,
          discountPercentage: 20
        }
      ]
    },
    specifications: {
      brand: "AquaFlow",
      model: "AF-DK500",
      manufacturer: "AquaFlow Systems",
      dimensions: {
        length: 100,
        width: 50,
        height: 30,
        unit: "cm"
      },
      certifications: ["ISO-9001", "Water Efficiency Certified"]
    },
    availability: {
      status: "In Stock",
      quantity: 15,
      leadTime: "3-5 days",
      shippingInfo: {
        methods: ["Standard Delivery", "Installation Service"],
        costs: {
          standard: 25,
          installation: 100
        }
      }
    },
    location: {
      governorate: "Sousse",
      city: "Sousse City",
      coordinates: {
        lat: 35.8245,
        lng: 10.6346
      }
    },
    ratings: {
      averageRating: 4.7,
      totalReviews: 32,
      ratingDistribution: {
        5: 25,
        4: 5,
        3: 2,
        2: 0,
        1: 0
      }
    },
    tags: ["Irrigation", "Water Efficiency", "Professional", "Complete Kit"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Premium Olive Tree Fertilizer",
    description: "Specialized fertilizer blend optimized for olive trees. Enhances fruit production and tree health.",
    category: "Fertilizers",
    type: "Tree Fertilizers",
    images: [
      "/fertilizers/olive-fertilizer-1.jpg",
      "/fertilizers/olive-fertilizer-2.jpg"
    ],
    pricing: {
      price: 35.99,
      unit: "kg",
      currency: "TND",
      minimumOrder: 5,
      bulkDiscounts: [
        {
          quantity: 25,
          discountPercentage: 15
        }
      ]
    },
    specifications: {
      brand: "OliveGrow",
      model: "OG-F200",
      manufacturer: "OliveGrow Nutrients",
      composition: {
        nitrogen: "10%",
        phosphorus: "15%",
        potassium: "20%",
        trace: "5%"
      },
      applicationMethod: "Soil Application",
      certifications: ["Organic Compatible", "Lab Tested"]
    },
    availability: {
      status: "In Stock",
      quantity: 1000,
      leadTime: "1-2 days",
      shippingInfo: {
        methods: ["Standard Delivery", "Express Delivery"],
        costs: {
          standard: 15,
          express: 30
        }
      }
    },
    location: {
      governorate: "Sfax",
      city: "Sfax City",
      coordinates: {
        lat: 34.7406,
        lng: 10.7603
      }
    },
    ratings: {
      averageRating: 4.9,
      totalReviews: 67,
      ratingDistribution: {
        5: 60,
        4: 5,
        3: 2,
        2: 0,
        1: 0
      }
    },
    tags: ["Fertilizer", "Olive Trees", "Professional Grade", "Organic Compatible"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Compact Tractor",
    description: "Versatile compact tractor suitable for small to medium farms. Powerful engine with multiple attachment options.",
    category: "Machinery",
    type: "Farm Vehicles",
    images: [
      "/machinery/compact-tractor-1.jpg",
      "/machinery/compact-tractor-2.jpg"
    ],
    pricing: {
      price: 45000,
      unit: "piece",
      currency: "TND",
      minimumOrder: 1,
    },
    specifications: {
      brand: "AgriPower",
      model: "AP-CT100",
      manufacturer: "AgriPower Machinery",
      weight: 1200,
      dimensions: {
        length: 300,
        width: 150,
        height: 200,
        unit: "cm"
      },
      certifications: ["CE Certified", "Safety Certified"]
    },
    availability: {
      status: "Limited",
      quantity: 3,
      leadTime: "7-10 days",
      shippingInfo: {
        methods: ["Specialized Transport", "Self Pickup"],
        costs: {
          transport: 500
        }
      }
    },
    location: {
      governorate: "Tunis",
      city: "Tunis City",
      coordinates: {
        lat: 36.8065,
        lng: 10.1815
      }
    },
    ratings: {
      averageRating: 4.6,
      totalReviews: 12,
      ratingDistribution: {
        5: 8,
        4: 3,
        3: 1,
        2: 0,
        1: 0
      }
    },
    tags: ["Machinery", "Tractor", "Farm Equipment", "Professional"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function populateResources() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const resourcesCollection = db.collection('resources');

    // Create supplier user if not exists
    const usersCollection = db.collection('users');
    const supplier = await usersCollection.findOne({ email: 'supplier@agrishe.com' });
    let supplierId;

    if (!supplier) {
      const supplierResult = await usersCollection.insertOne({
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
      supplierId = supplierResult.insertedId;
      console.log('Created supplier user');
    } else {
      supplierId = supplier._id;
      console.log('Using existing supplier user');
    }

    // Add supplier ID to resources
    const resourcesWithSupplier = sampleResources.map(resource => ({
      ...resource,
      supplierId
    }));

    // Insert resources
    const result = await resourcesCollection.insertMany(resourcesWithSupplier);
    console.log(`${result.insertedCount} resources inserted`);

    // Create indexes
    await resourcesCollection.createIndex({ "supplierId": 1 });
    await resourcesCollection.createIndex({ "category": 1 });
    await resourcesCollection.createIndex({ "type": 1 });
    await resourcesCollection.createIndex({ "location.governorate": 1 });
    await resourcesCollection.createIndex({ "availability.status": 1 });
    await resourcesCollection.createIndex({ "ratings.averageRating": -1 });
    await resourcesCollection.createIndex({ "createdAt": -1 });
    
    console.log('Created indexes');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

populateResources().catch(console.error);