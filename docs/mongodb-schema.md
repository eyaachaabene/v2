# Agri-SHE Platform - MongoDB Backend Architecture

## Database Schema Design

### 1. Users Collection
\`\`\`javascript
{
  _id: ObjectId,
  email: String, // unique
  password: String, // hashed
  role: String, // "farmer", "buyer", "admin", "partner", "ngo"
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    avatar: String, // URL to profile image
    location: {
      governorate: String, // Tunis, Sfax, Sousse, etc.
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    dateOfBirth: Date,
    gender: String,
    languages: [String], // ["Arabic", "French", "English"]
  },
  farmerProfile: { // Only for farmers
    farmName: String,
    farmSize: Number, // in hectares
    farmingExperience: Number, // years
    specializations: [String], // ["Olives", "Tomatoes", "Herbs", etc.]
    certifications: [String], // ["Organic", "Fair Trade", etc.]
    farmLocation: {
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    bankDetails: {
      accountNumber: String,
      bankName: String,
      iban: String
    }
  },
  buyerProfile: { // Only for buyers
    companyName: String,
    businessType: String, // "Restaurant", "Retailer", "Distributor", etc.
    taxId: String,
    preferredProducts: [String],
    averageOrderValue: Number
  },
  preferences: {
    notifications: {
      email: Boolean,
      sms: Boolean,
      push: Boolean
    },
    language: String,
    currency: String // "TND"
  },
  verification: {
    emailVerified: Boolean,
    phoneVerified: Boolean,
    identityVerified: Boolean,
    farmVerified: Boolean // For farmers
  },
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  isActive: Boolean
}
\`\`\`

### 2. Products Collection
\`\`\`javascript
{
  _id: ObjectId,
  farmerId: ObjectId, // Reference to Users
  name: String,
  description: String,
  category: String, // "Olives", "Tomatoes", "Wheat", "Citrus", "Herbs", "Dates"
  subcategory: String, // "Extra Virgin", "Cherry", "Durum", etc.
  images: [String], // Array of image URLs
  pricing: {
    price: Number,
    unit: String, // "kg", "L", "box", "bundle"
    currency: String, // "TND"
    minimumOrder: Number,
    bulkDiscounts: [{
      quantity: Number,
      discountPercentage: Number
    }]
  },
  availability: {
    status: String, // "In Stock", "Limited", "Out of Stock", "Seasonal"
    quantity: Number,
    harvestDate: Date,
    expiryDate: Date,
    seasonalAvailability: {
      startMonth: Number, // 1-12
      endMonth: Number // 1-12
    }
  },
  quality: {
    organic: Boolean,
    certifications: [String],
    gradeLevel: String, // "Premium", "Standard", "Economy"
    qualityScore: Number // 1-5
  },
  specifications: {
    origin: String,
    processingMethod: String,
    storageConditions: String,
    shelfLife: String,
    nutritionalInfo: Object
  },
  tags: [String], // ["Organic", "Cold-Pressed", "Premium", etc.]
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
  seo: {
    slug: String,
    metaTitle: String,
    metaDescription: String
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### 3. Orders Collection
\`\`\`javascript
{
  _id: ObjectId,
  orderNumber: String, // "ORD-001", unique
  buyerId: ObjectId, // Reference to Users
  farmerId: ObjectId, // Reference to Users
  items: [{
    productId: ObjectId,
    productName: String,
    quantity: Number,
    unit: String,
    unitPrice: Number,
    totalPrice: Number,
    specifications: Object // Any special requirements
  }],
  pricing: {
    subtotal: Number,
    deliveryFee: Number,
    taxes: Number,
    discounts: Number,
    totalAmount: Number,
    currency: String // "TND"
  },
  delivery: {
    method: String, // "Pickup", "Delivery", "Shipping"
    address: {
      street: String,
      city: String,
      governorate: String,
      postalCode: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    scheduledDate: Date,
    deliveredDate: Date,
    trackingNumber: String
  },
  payment: {
    method: String, // "Cash", "Bank Transfer", "Mobile Payment"
    status: String, // "Pending", "Paid", "Failed", "Refunded"
    transactionId: String,
    paidAt: Date
  },
  status: String, // "Pending", "Confirmed", "Preparing", "Ready", "Delivered", "Cancelled"
  communication: [{
    senderId: ObjectId,
    message: String,
    timestamp: Date,
    type: String // "message", "status_update", "system"
  }],
  timeline: [{
    status: String,
    timestamp: Date,
    note: String
  }],
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### 4. IoT Sensors Collection
\`\`\`javascript
{
  _id: ObjectId,
  farmerId: ObjectId, // Reference to Users
  sensorId: String, // Unique hardware identifier
  name: String, // "North Field - Sensor 1"
  type: String, // "soil_moisture", "temperature", "ph", "humidity"
  location: {
    fieldName: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    depth: Number // For soil sensors
  },
  specifications: {
    model: String,
    manufacturer: String,
    installationDate: Date,
    calibrationDate: Date,
    batteryLevel: Number, // 0-100
    signalStrength: Number // 0-100
  },
  thresholds: {
    min: Number,
    max: Number,
    optimal: {
      min: Number,
      max: Number
    }
  },
  status: String, // "Online", "Offline", "Maintenance", "Error"
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### 5. Sensor Readings Collection
\`\`\`javascript
{
  _id: ObjectId,
  sensorId: ObjectId, // Reference to IoT Sensors
  farmerId: ObjectId, // Reference to Users
  readings: {
    value: Number,
    unit: String,
    quality: String, // "Good", "Fair", "Poor"
    batteryLevel: Number,
    signalStrength: Number
  },
  alerts: [{
    type: String, // "threshold_exceeded", "low_battery", "sensor_offline"
    severity: String, // "low", "medium", "high", "critical"
    message: String,
    acknowledged: Boolean,
    acknowledgedAt: Date
  }],
  weather: { // Associated weather data
    temperature: Number,
    humidity: Number,
    rainfall: Number,
    windSpeed: Number
  },
  timestamp: Date,
  processed: Boolean // For batch processing
}
\`\`\`

### 6. Irrigation Systems Collection
\`\`\`javascript
{
  _id: ObjectId,
  farmerId: ObjectId, // Reference to Users
  systemId: String, // Unique hardware identifier
  name: String, // "Main Irrigation System"
  type: String, // "drip", "sprinkler", "flood"
  zones: [{
    zoneId: String,
    name: String, // "North Field Zone 1"
    area: Number, // square meters
    cropType: String,
    sensors: [ObjectId], // References to IoT Sensors
    valves: [{
      valveId: String,
      status: String, // "open", "closed", "partial"
      flowRate: Number // L/min
    }]
  }],
  schedule: {
    mode: String, // "automatic", "manual", "scheduled"
    intervals: [{
      startTime: String, // "06:00"
      duration: Number, // minutes
      days: [String], // ["Monday", "Wednesday", "Friday"]
      zones: [String] // Zone IDs
    }]
  },
  settings: {
    autoMode: Boolean,
    weatherIntegration: Boolean,
    soilMoistureThreshold: Number,
    maxDailyWater: Number, // liters
    emergencyShutoff: Boolean
  },
  status: String, // "Active", "Paused", "Maintenance", "Error"
  lastOperation: {
    type: String, // "irrigation", "maintenance", "manual_override"
    timestamp: Date,
    duration: Number, // minutes
    waterUsed: Number, // liters
    zones: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### 7. Irrigation Logs Collection
\`\`\`javascript
{
  _id: ObjectId,
  systemId: ObjectId, // Reference to Irrigation Systems
  farmerId: ObjectId, // Reference to Users
  operation: {
    type: String, // "scheduled", "manual", "automatic", "emergency_stop"
    triggeredBy: String, // "schedule", "sensor", "user", "weather"
    zones: [String],
    startTime: Date,
    endTime: Date,
    duration: Number, // minutes
    waterUsed: Number, // liters per zone
    totalWaterUsed: Number // liters
  },
  conditions: {
    soilMoisture: Number,
    temperature: Number,
    humidity: Number,
    weather: String, // "sunny", "rainy", "cloudy"
    rainfall: Number // mm
  },
  efficiency: {
    waterSaved: Number, // compared to traditional methods
    energyUsed: Number, // kWh
    costSaved: Number // TND
  },
  notes: String,
  timestamp: Date
}
\`\`\`

### 8. Opportunities Collection
\`\`\`javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  type: String, // "Seasonal Work", "Part-time Job", "Training", "Workshop", "Technical Work"
  category: String, // "Harvesting", "Training", "Technical", "Leadership"
  postedBy: ObjectId, // Reference to Users
  postedByType: String, // "Farmer", "NGO", "Partner", "Government"
  location: {
    governorate: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    remote: Boolean
  },
  compensation: {
    type: String, // "Paid", "Free", "Certificate", "Networking"
    amount: Number,
    currency: String, // "TND"
    period: String, // "day", "week", "month", "total"
    benefits: [String] // ["Certificate", "Meals", "Transportation"]
  },
  requirements: {
    experience: String, // "Beginner", "Intermediate", "Advanced"
    skills: [String],
    education: String,
    age: {
      min: Number,
      max: Number
    },
    gender: String, // "Any", "Female", "Male"
    languages: [String]
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    duration: String, // "2 weeks", "3 days"
    workingHours: String, // "8:00-16:00"
    flexible: Boolean
  },
  application: {
    deadline: Date,
    method: String, // "Platform", "Email", "Phone"
    requirements: [String], // ["CV", "Cover Letter", "Portfolio"]
    maxApplicants: Number
  },
  status: String, // "Open", "Closed", "Filled", "Cancelled"
  priority: String, // "Normal", "Urgent", "Featured"
  tags: [String],
  applicants: [{
    userId: ObjectId,
    appliedAt: Date,
    status: String, // "Applied", "Reviewed", "Accepted", "Rejected"
    notes: String
  }],
  views: Number,
  saves: Number,
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date
}
\`\`\`

### 9. Learning Modules Collection
\`\`\`javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String, // "Irrigation", "Pest Control", "Marketing", "Business"
  type: String, // "Video", "Article", "Interactive", "Quiz"
  level: String, // "Beginner", "Intermediate", "Advanced"
  content: {
    videoUrl: String,
    duration: Number, // minutes
    transcript: String,
    materials: [String], // URLs to PDFs, images
    quiz: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }]
  },
  metadata: {
    author: String,
    language: String, // "Arabic", "French", "English"
    tags: [String],
    prerequisites: [ObjectId], // References to other modules
    difficulty: Number, // 1-5
    estimatedTime: Number // minutes
  },
  engagement: {
    views: Number,
    completions: Number,
    averageRating: Number,
    totalRatings: Number,
    bookmarks: Number
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### 10. User Progress Collection
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users
  moduleId: ObjectId, // Reference to Learning Modules
  progress: {
    status: String, // "Not Started", "In Progress", "Completed"
    completionPercentage: Number, // 0-100
    timeSpent: Number, // minutes
    lastAccessed: Date,
    completedAt: Date
  },
  quiz: {
    attempts: Number,
    bestScore: Number, // 0-100
    lastScore: Number,
    answers: [Number], // Array of selected answers
    completedAt: Date
  },
  notes: String,
  rating: Number, // 1-5
  feedback: String,
  certificate: {
    issued: Boolean,
    issuedAt: Date,
    certificateUrl: String
  },
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### 11. Tasks Collection
\`\`\`javascript
{
  _id: ObjectId,
  farmerId: ObjectId, // Reference to Users
  title: String,
  description: String,
  category: String, // "Irrigation", "Harvesting", "Pest Control", "Maintenance"
  priority: String, // "Low", "Medium", "High", "Critical"
  status: String, // "Pending", "In Progress", "Completed", "Overdue", "Cancelled"
  schedule: {
    dueDate: Date,
    estimatedDuration: Number, // minutes
    recurringType: String, // "None", "Daily", "Weekly", "Monthly", "Seasonal"
    recurringInterval: Number,
    recurringEndDate: Date
  },
  location: {
    fieldName: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  resources: {
    equipment: [String],
    materials: [String],
    estimatedCost: Number,
    currency: String // "TND"
  },
  completion: {
    completedAt: Date,
    actualDuration: Number, // minutes
    actualCost: Number,
    notes: String,
    photos: [String], // URLs to completion photos
    quality: Number // 1-5
  },
  reminders: [{
    type: String, // "Email", "SMS", "Push"
    scheduledFor: Date,
    sent: Boolean,
    sentAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### 12. Weather Data Collection
\`\`\`javascript
{
  _id: ObjectId,
  location: {
    governorate: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  current: {
    temperature: Number, // Celsius
    humidity: Number, // Percentage
    pressure: Number, // hPa
    windSpeed: Number, // km/h
    windDirection: Number, // degrees
    visibility: Number, // km
    uvIndex: Number,
    condition: String, // "Sunny", "Cloudy", "Rainy", etc.
    icon: String
  },
  forecast: [{
    date: Date,
    temperature: {
      min: Number,
      max: Number
    },
    humidity: Number,
    precipitation: {
      probability: Number, // 0-100
      amount: Number // mm
    },
    wind: {
      speed: Number,
      direction: Number
    },
    condition: String,
    icon: String
  }],
  alerts: [{
    type: String, // "Rain", "Storm", "Heat", "Frost"
    severity: String, // "Low", "Medium", "High"
    message: String,
    startTime: Date,
    endTime: Date,
    affectedAreas: [String]
  }],
  source: String, // "OpenWeatherMap", "AccuWeather"
  timestamp: Date,
  expiresAt: Date
}
\`\`\`

### 13. Notifications Collection
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users
  type: String, // "Weather", "Irrigation", "Order", "Opportunity", "System"
  category: String, // "Alert", "Reminder", "Update", "Marketing"
  title: String,
  message: String,
  data: Object, // Additional data for the notification
  channels: {
    push: {
      sent: Boolean,
      sentAt: Date,
      delivered: Boolean,
      deliveredAt: Date
    },
    email: {
      sent: Boolean,
      sentAt: Date,
      opened: Boolean,
      openedAt: Date
    },
    sms: {
      sent: Boolean,
      sentAt: Date,
      delivered: Boolean,
      deliveredAt: Date
    }
  },
  status: String, // "Unread", "Read", "Archived"
  priority: String, // "Low", "Medium", "High", "Critical"
  actionUrl: String, // Deep link to relevant page
  readAt: Date,
  archivedAt: Date,
  expiresAt: Date,
  createdAt: Date
}
\`\`\`

### 14. Reviews Collection
\`\`\`javascript
{
  _id: ObjectId,
  reviewerId: ObjectId, // Reference to Users (buyer)
  revieweeId: ObjectId, // Reference to Users (farmer)
  productId: ObjectId, // Reference to Products
  orderId: ObjectId, // Reference to Orders
  rating: Number, // 1-5
  review: {
    title: String,
    content: String,
    pros: [String],
    cons: [String]
  },
  criteria: {
    quality: Number, // 1-5
    packaging: Number, // 1-5
    delivery: Number, // 1-5
    communication: Number, // 1-5
    value: Number // 1-5
  },
  media: {
    photos: [String], // URLs to review photos
    videos: [String] // URLs to review videos
  },
  helpful: {
    upvotes: Number,
    downvotes: Number,
    voters: [ObjectId] // User IDs who voted
  },
  response: {
    content: String,
    respondedAt: Date,
    respondedBy: ObjectId // Usually the farmer
  },
  status: String, // "Published", "Pending", "Flagged", "Hidden"
  verified: Boolean, // Verified purchase
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### 15. Messages Collection
\`\`\`javascript
{
  _id: ObjectId,
  conversationId: String, // Unique conversation identifier
  participants: [ObjectId], // References to Users
  messages: [{
    senderId: ObjectId,
    content: String,
    type: String, // "text", "image", "file", "location", "product_share"
    attachments: [{
      type: String, // "image", "document", "audio"
      url: String,
      filename: String,
      size: Number
    }],
    metadata: {
      productId: ObjectId, // If sharing a product
      orderId: ObjectId, // If discussing an order
      location: {
        lat: Number,
        lng: Number,
        address: String
      }
    },
    status: String, // "Sent", "Delivered", "Read"
    timestamp: Date,
    editedAt: Date,
    deletedAt: Date
  }],
  lastMessage: {
    content: String,
    senderId: ObjectId,
    timestamp: Date
  },
  unreadCount: {
    // Per participant
    [userId]: Number
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### 16. Analytics Collection
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users
  type: String, // "farm", "product", "order", "user"
  period: {
    type: String, // "daily", "weekly", "monthly", "yearly"
    date: Date,
    year: Number,
    month: Number,
    week: Number,
    day: Number
  },
  metrics: {
    // Farm Analytics
    totalRevenue: Number,
    totalOrders: Number,
    averageOrderValue: Number,
    topProducts: [{
      productId: ObjectId,
      productName: String,
      revenue: Number,
      quantity: Number
    }],
    customerRetention: Number,
    
    // IoT Analytics
    waterUsage: Number, // liters
    waterSaved: Number, // liters
    irrigationEvents: Number,
    sensorReadings: Number,
    alertsGenerated: Number,
    
    // Learning Analytics
    modulesCompleted: Number,
    timeSpentLearning: Number, // minutes
    certificatesEarned: Number,
    
    // Marketplace Analytics
    productViews: Number,
    inquiries: Number,
    conversionRate: Number
  },
  createdAt: Date
}
\`\`\`

## API Endpoints Structure

### Authentication & Users
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- GET /api/users/profile
- PUT /api/users/profile
- POST /api/users/verify-email
- POST /api/users/verify-phone

### Products & Marketplace
- GET /api/products
- POST /api/products
- GET /api/products/:id
- PUT /api/products/:id
- DELETE /api/products/:id
- GET /api/products/farmer/:farmerId
- POST /api/products/:id/reviews

### Orders
- GET /api/orders
- POST /api/orders
- GET /api/orders/:id
- PUT /api/orders/:id/status
- POST /api/orders/:id/messages

### IoT & Irrigation
- GET /api/iot/sensors
- POST /api/iot/sensors
- GET /api/iot/sensors/:id/readings
- POST /api/iot/sensors/:id/readings
- GET /api/irrigation/systems
- POST /api/irrigation/systems/:id/control
- GET /api/irrigation/logs

### Opportunities
- GET /api/opportunities
- POST /api/opportunities
- POST /api/opportunities/:id/apply
- GET /api/opportunities/applications

### Learning
- GET /api/learning/modules
- GET /api/learning/modules/:id
- POST /api/learning/modules/:id/progress
- GET /api/learning/progress

### Tasks & Scheduling
- GET /api/tasks
- POST /api/tasks
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

### Weather & Notifications
- GET /api/weather/:location
- GET /api/notifications
- PUT /api/notifications/:id/read
- POST /api/notifications/preferences

### Analytics & Reports
- GET /api/analytics/dashboard
- GET /api/analytics/farm
- GET /api/analytics/products
- GET /api/reports/revenue
- GET /api/reports/iot

## Indexes for Performance

\`\`\`javascript
// Users Collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "profile.location.governorate": 1 })
db.users.createIndex({ "farmerProfile.specializations": 1 })

// Products Collection
db.products.createIndex({ "farmerId": 1 })
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "availability.status": 1 })
db.products.createIndex({ "ratings.averageRating": -1 })
db.products.createIndex({ "createdAt": -1 })

// Orders Collection
db.orders.createIndex({ "buyerId": 1 })
db.orders.createIndex({ "farmerId": 1 })
db.orders.createIndex({ "status": 1 })
db.orders.createIndex({ "createdAt": -1 })

// IoT Sensors Collection
db.iot_sensors.createIndex({ "farmerId": 1 })
db.iot_sensors.createIndex({ "sensorId": 1 }, { unique: true })
db.iot_sensors.createIndex({ "status": 1 })

// Sensor Readings Collection
db.sensor_readings.createIndex({ "sensorId": 1, "timestamp": -1 })
db.sensor_readings.createIndex({ "farmerId": 1, "timestamp": -1 })
db.sensor_readings.createIndex({ "timestamp": -1 })

// Opportunities Collection
db.opportunities.createIndex({ "type": 1 })
db.opportunities.createIndex({ "location.governorate": 1 })
db.opportunities.createIndex({ "status": 1 })
db.opportunities.createIndex({ "createdAt": -1 })
db.opportunities.createIndex({ "application.deadline": 1 })

// Learning Modules Collection
db.learning_modules.createIndex({ "category": 1 })
db.learning_modules.createIndex({ "level": 1 })
db.learning_modules.createIndex({ "engagement.averageRating": -1 })

// Tasks Collection
db.tasks.createIndex({ "farmerId": 1 })
db.tasks.createIndex({ "status": 1 })
db.tasks.createIndex({ "schedule.dueDate": 1 })
db.tasks.createIndex({ "priority": 1 })

// Weather Data Collection
db.weather_data.createIndex({ "location.governorate": 1, "timestamp": -1 })
db.weather_data.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })

// Notifications Collection
db.notifications.createIndex({ "userId": 1, "createdAt": -1 })
db.notifications.createIndex({ "status": 1 })
db.notifications.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })

// Reviews Collection
db.reviews.createIndex({ "productId": 1 })
db.reviews.createIndex({ "revieweeId": 1 })
db.reviews.createIndex({ "rating": -1 })

// Messages Collection
db.messages.createIndex({ "conversationId": 1 })
db.messages.createIndex({ "participants": 1 })
db.messages.createIndex({ "lastMessage.timestamp": -1 })

// Analytics Collection
db.analytics.createIndex({ "userId": 1, "period.date": -1 })
db.analytics.createIndex({ "type": 1, "period.date": -1 })
\`\`\`

This comprehensive MongoDB schema supports all the features in your Agri-SHE platform including user management, IoT sensor data, irrigation systems, marketplace functionality, learning modules, task management, weather integration, and analytics.
