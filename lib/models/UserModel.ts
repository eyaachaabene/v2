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
  // Enhanced Social Media Features
  socialProfile: {
    bio: {
      type: String,
      maxlength: 500,
      trim: true
    },
    coverImage: {
      type: String, // URL to cover photo
    },
    socialLinks: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String,
      website: String
    },
    achievements: [{
      title: String,
      description: String,
      icon: String,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }],
    skills: [String],
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    profileViews: {
      type: Number,
      default: 0
    },
    helpfulAnswers: {
      type: Number,
      default: 0
    }
  },
  
  // Friends System (Auto-accepted connections)
  friends: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    lastMessageAt: Date,
    unreadMessages: {
      type: Number,
      default: 0
    }
  }],
  
  // Connection System (for legacy support)
  connections: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'blocked'],
      default: 'accepted' // Auto-accept for friend system
    },
    connectedAt: {
      type: Date,
      default: Date.now
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Following System (asymmetric)
  following: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    followedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  followers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    followedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Privacy Settings
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'public'
    },
    postVisibility: {
      type: String,
      enum: ['public', 'connections', 'followers', 'private'],
      default: 'public'
    },
    contactInfoVisibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'connections'
    },
    showConnectionsList: {
      type: Boolean,
      default: true
    },
    allowConnectionRequests: {
      type: Boolean,
      default: true
    },
    allowFollowers: {
      type: Boolean,
      default: true
    }
  },
  
  // Social Statistics (virtual fields will be added later)
  socialStats: {
    postsCount: {
      type: Number,
      default: 0
    },
    connectionsCount: {
      type: Number,
      default: 0
    },
    friendsCount: {
      type: Number,
      default: 0
    },
    followersCount: {
      type: Number,
      default: 0
    },
    followingCount: {
      type: Number,
      default: 0
    }
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
      },
      connectionRequests: {
        type: Boolean,
        default: true
      },
      newFollowers: {
        type: Boolean,
        default: true
      },
      postLikes: {
        type: Boolean,
        default: true
      },
      postComments: {
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

// Virtual fields for calculated metrics
UserSchema.virtual('mutualConnections').get(function() {
  // This will be calculated in API calls with aggregation
  return []
})

UserSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`
})

UserSchema.virtual('connectionStatus').get(function() {
  // This will be calculated dynamically based on the viewing user
  return 'none'
})

// Methods for social features
UserSchema.methods.getConnectionStatus = function(otherUserId: string) {
  const connection = this.connections.find((conn: any) => 
    conn.user.toString() === otherUserId.toString()
  )
  return connection ? connection.status : 'none'
}

UserSchema.methods.isFollowing = function(otherUserId: string) {
  return this.following.some((follow: any) => 
    follow.user.toString() === otherUserId.toString()
  )
}

UserSchema.methods.isFollowedBy = function(otherUserId: string) {
  return this.followers.some((follower: any) => 
    follower.user.toString() === otherUserId.toString()
  )
}

// Pre-save middleware to update social stats
UserSchema.pre('save', function(next) {
  if (this.isModified('connections')) {
    this.socialStats.connectionsCount = this.connections.filter(
      (conn: any) => conn.status === 'accepted'
    ).length
  }
  
  if (this.isModified('friends')) {
    this.socialStats.friendsCount = this.friends.length
  }
  
  if (this.isModified('followers')) {
    this.socialStats.followersCount = this.followers.length
  }
  
  if (this.isModified('following')) {
    this.socialStats.followingCount = this.following.length
  }
  
  next()
})

// Indexes for better performance
UserSchema.index({ role: 1 })
UserSchema.index({ 'profile.location.governorate': 1 })
UserSchema.index({ 'farmerProfile.specializations': 1 })
UserSchema.index({ 'connections.user': 1 })
UserSchema.index({ 'connections.status': 1 })
UserSchema.index({ 'friends.user': 1 })
UserSchema.index({ 'following.user': 1 })
UserSchema.index({ 'followers.user': 1 })
UserSchema.index({ 'socialProfile.skills': 1 })
UserSchema.index({ 'privacySettings.profileVisibility': 1 })
UserSchema.index({ 'profile.firstName': 'text', 'profile.lastName': 'text', 'socialProfile.bio': 'text' })

export default mongoose.models.User || mongoose.model('User', UserSchema)