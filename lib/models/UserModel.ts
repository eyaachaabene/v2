import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["farmer", "buyer", "supplier", "admin", "partner", "ngo"],
    required: true
  },
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: {
      type: String, // URL to profile image
    },
    location: {
      governorate: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        trim: true
      },
      address: {
        type: String,
        trim: true
      },
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    dateOfBirth: Date,
    gender: String,
    languages: [String],
    interests: [String]
  },
  farmerProfile: {
    farmName: String,
    farmSize: Number,
    farmingExperience: Number,
    specializations: [String],
    certifications: [String],
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
  buyerProfile: {
    companyName: String,
    businessType: String,
    taxId: String,
    preferredProducts: [String],
    averageOrderValue: Number
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'TND'
    }
  },
  verification: {
    emailVerified: {
      type: Boolean,
      default: false
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    identityVerified: {
      type: Boolean,
      default: false
    },
    farmVerified: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, {
  timestamps: true
})

// Indexes for better performance
UserSchema.index({ role: 1 })
UserSchema.index({ 'profile.location.governorate': 1 })
UserSchema.index({ 'farmerProfile.specializations': 1 })

export default mongoose.models.User || mongoose.model('User', UserSchema)