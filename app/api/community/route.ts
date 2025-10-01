import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { verifyToken } from '@/lib/auth-middleware'

// GET - Fetch community posts
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const tags = searchParams.get('tags')?.split(',')
    
    // Build query
    const query: any = { isActive: true }
    if (category && category !== 'General') {
      query.category = category
    }
    if (tags && tags.length > 0 && tags[0] !== '') {
      query.tags = { $in: tags }
    }
    
    // Fetch posts with pagination
    const posts = await db.collection('posts')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .toArray()

    // For each post, fetch user details with enhanced profile information
    const transformedPosts = await Promise.all(posts.map(async (post: any) => {
      // Get recent comments (limit to 3 for initial load)
      const recentComments = post.comments ? post.comments.slice(-3) : []
      
      // Fetch user details for the post author
      let authorInfo = {
        id: post.authorId ? post.authorId.toString() : null,
        name: "Anonymous",
        avatar: "/placeholder-user.jpg",
        role: "farmer",
        location: "Unknown",
        isConnected: false,
        isFollowing: false
      }

      if (post.authorId) {
        try {
          const author = await db.collection('users').findOne(
            { _id: post.authorId },
            { 
              projection: { 
                'profile.firstName': 1, 
                'profile.lastName': 1, 
                'profile.avatar': 1,
                'profile.location': 1,
                'role': 1,
                'connections': 1,
                'followers': 1
              } 
            }
          )
          
          if (author) {
            authorInfo = {
              id: author._id.toString(),
              name: `${author.profile.firstName} ${author.profile.lastName}`,
              avatar: author.profile.avatar || "/placeholder-user.jpg",
              role: author.role || "farmer",
              location: `${author.profile.location?.city || ''}, ${author.profile.location?.governorate || ''}`.replace(/^,\s*|,\s*$/g, '') || "Unknown",
              isConnected: false,
              isFollowing: false
            }

            // Check if requesting user is connected or following
            const tokenPayload = await verifyToken(request)
            if (tokenPayload?.userId && tokenPayload.userId !== author._id.toString()) {
              // Check connection status
              const connection = author.connections?.find((conn: any) => 
                conn.user.toString() === tokenPayload.userId && conn.status === 'accepted'
              )
              authorInfo.isConnected = !!connection

              // Check following status
              const isFollowing = author.followers?.some((follower: any) => 
                follower.user.toString() === tokenPayload.userId
              )
              authorInfo.isFollowing = !!isFollowing
            }
          }
        } catch (err) {
          console.error('Error fetching author info:', err)
        }
      }
      
      // Fetch user details for comments
      const commentsWithUsers = await Promise.all(recentComments.map(async (comment: any) => {
        try {
          const user = await db.collection('users').findOne(
            { _id: comment.user },
            { projection: { 'profile.firstName': 1, 'profile.lastName': 1, 'profile.avatar': 1 } }
          )
          
          return {
            id: comment._id?.toString() || Date.now().toString(),
            user: {
              id: comment.user.toString(),
              name: user ? `${user.profile.firstName} ${user.profile.lastName}` : 'Anonymous',
              avatar: user?.profile.avatar || '/placeholder-user.jpg'
            },
            content: comment.content,
            createdAt: comment.createdAt
          }
        } catch (err) {
          console.error('Error fetching user for comment:', err)
          return {
            id: comment._id?.toString() || Date.now().toString(),
            user: {
              id: comment.user.toString(),
              name: 'Anonymous',
              avatar: '/placeholder-user.jpg'
            },
            content: comment.content,
            createdAt: comment.createdAt
          }
        }
      }))

      return {
        id: post._id.toString(),
        author: authorInfo.name,
        authorId: authorInfo.id,
        authorRole: authorInfo.role,
        location: authorInfo.location,
        avatar: authorInfo.avatar,
        isConnected: authorInfo.isConnected,
        isFollowing: authorInfo.isFollowing,
        time: getTimeAgo(post.createdAt),
        content: post.content,
        tags: post.tags || [],
        likes: post.likes?.length || 0,
        comments: post.comments?.length || 0,
        images: post.images || [],
        category: post.category,
        createdAt: post.createdAt,
        postComments: commentsWithUsers
      }
    }))

    // Get total count for pagination
    const totalPosts = await db.collection('posts').countDocuments(query)
    
    return NextResponse.json({
      success: true,
      posts: transformedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasNext: page * limit < totalPosts,
        hasPrev: page > 1
      }
    })
    
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST - Create a new community post
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const tokenPayload = await verifyToken(request)
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const db = await getDatabase()
    
    const body = await request.json()
    const { content, tags, category, images, visibility } = body
    
    // Validation
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Post content is required' },
        { status: 400 }
      )
    }
    
    if (content.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Post content must be less than 2000 characters' },
        { status: 400 }
      )
    }

    // Create new post
    const newPost = {
      author: new ObjectId(tokenPayload.userId),
      content: content.trim(),
      tags: tags || [],
      category: category || 'General',
      images: images || [],
      visibility: visibility || 'public',
      likes: [],
      comments: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('posts').insertOne(newPost)
    
    // Transform the response to match frontend format
    const transformedPost = {
      id: result.insertedId.toString(),
      author: "You", // Mock data for the current user
      location: "Tunisia", // Mock data for now
      avatar: "/farmer-avatar-1.jpg", // Mock data for now
      time: getTimeAgo(newPost.createdAt),
      content: newPost.content,
      tags: newPost.tags,
      likes: 0,
      comments: 0,
      images: newPost.images,
      category: newPost.category,
      createdAt: newPost.createdAt
    }

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      post: transformedPost
    })
    
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  } else {
    return date.toLocaleDateString()
  }
}