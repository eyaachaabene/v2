import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import Post from '@/lib/models/Post'
import User from '@/lib/models/UserModel'
import { authMiddleware } from '@/lib/auth-middleware'

// POST - Add a comment to a post
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      )
    }

    await connectMongoDB()
    
    const postId = params.id
    const userId = authResult.userId
    const { content } = await request.json()
    
    // Validation
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      )
    }
    
    if (content.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Comment must be less than 500 characters' },
        { status: 400 }
      )
    }

    const post = await Post.findById(postId)
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Add comment
    const newComment = {
      user: userId,
      content: content.trim(),
      createdAt: new Date()
    }

    post.comments.push(newComment)
    await post.save()

    // Get user data manually to avoid populate issues
    const user = await User.findById(userId).select('profile.firstName profile.lastName profile.avatar')
    
    const addedComment = post.comments[post.comments.length - 1]

    return NextResponse.json({
      success: true,
      comment: {
        id: addedComment._id,
        user: {
          id: userId,
          name: user ? `${user.profile.firstName} ${user.profile.lastName}` : 'Unknown User',
          avatar: user?.profile.avatar
        },
        content: addedComment.content,
        createdAt: addedComment.createdAt
      },
      commentCount: post.comments.length
    })
    
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}

// GET - Get comments for a post
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectMongoDB()
    
    const postId = params.id
    const post = await Post.findById(postId).select('comments')
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Get all unique user IDs from comments
    const userIds = [...new Set(post.comments.map((comment: any) => comment.user.toString()))]
    
    // Fetch all users at once
    const users = await User.find({ _id: { $in: userIds } })
      .select('profile.firstName profile.lastName profile.avatar')
    
    // Create a map for quick user lookup
    const userMap = users.reduce((map: any, user: any) => {
      map[user._id.toString()] = user
      return map
    }, {})

    const comments = post.comments.map((comment: any) => {
      const user = userMap[comment.user.toString()]
      return {
        id: comment._id,
        user: {
          id: comment.user,
          name: user ? `${user.profile.firstName} ${user.profile.lastName}` : 'Unknown User',
          avatar: user?.profile.avatar
        },
        content: comment.content,
        createdAt: comment.createdAt
      }
    })

    return NextResponse.json({
      success: true,
      comments,
      commentCount: comments.length
    })
    
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}