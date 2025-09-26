# Resources Collection Schema

\`\`\`javascript
{
  _id: ObjectId,
  supplierId: ObjectId, // Reference to Users
  name: String,
  description: String,
  category: String, // "Tools", "Pesticides", "Seeds", "Fertilizers", "Machinery", "Irrigation Equipment"
  type: String, // Specific type within category
  images: [String], // Array of image URLs
  pricing: {
    price: Number,
    unit: String, // "piece", "kg", "L", "package"
    currency: String, // "TND"
    minimumOrder: Number,
    bulkDiscounts: [{
      quantity: Number,
      discountPercentage: Number
    }]
  },
  specifications: {
    brand: String,
    model: String,
    manufacturer: String,
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: String // "cm", "m"
    },
    // For pesticides/fertilizers
    activeIngredients: [String],
    composition: Object,
    applicationMethod: String,
    safetyPeriod: String,
    certifications: [String]
  },
  availability: {
    status: String, // "In Stock", "Limited", "Out of Stock", "Pre-order"
    quantity: Number,
    leadTime: String, // Delivery/shipping time
    shippingInfo: {
      methods: [String],
      costs: Object
    }
  },
  location: {
    governorate: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  ratings: {
    averageRating: Number, // 1-5
    totalReviews: Number,
    ratingDistribution: {
      5: Number,
      4: Number,
      3: Number,
      2: Number,
      1: Number
    }
  },
  tags: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## Indexes
\`\`\`javascript
db.resources.createIndex({ "supplierId": 1 })
db.resources.createIndex({ "category": 1 })
db.resources.createIndex({ "type": 1 })
db.resources.createIndex({ "location.governorate": 1 })
db.resources.createIndex({ "availability.status": 1 })
db.resources.createIndex({ "ratings.averageRating": -1 })
db.resources.createIndex({ "createdAt": -1 })
\`\`\`