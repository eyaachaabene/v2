import mongoose from 'mongoose'

const PostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  images: [{
    type: String, // URLs to uploaded images
  }],
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['Question', 'Success Story', 'Knowledge Sharing', 'Weather Alert', 'General'],
    default: 'General'
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  reportCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes for better performance
PostSchema.index({ author: 1, createdAt: -1 })
PostSchema.index({ tags: 1 })
PostSchema.index({ category: 1 })
PostSchema.index({ createdAt: -1 })

// Virtual for like count
PostSchema.virtual('likeCount').get(function() {
  return this.likes.length
})

// Virtual for comment count
PostSchema.virtual('commentCount').get(function() {
  return this.comments.length
})

// Ensure virtual fields are serialized
PostSchema.set('toJSON', { virtuals: true })

export default mongoose.models.Post || mongoose.model('Post', PostSchema)