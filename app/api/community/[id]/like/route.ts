import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import Post from '@/lib/models/Post'
import { authMiddleware } from '@/lib/auth-middleware'

// POST - Toggle like on a post
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
    
    const post = await Post.findById(postId)
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user already liked the post
    const existingLikeIndex = post.likes.findIndex(
      (like: any) => like.user.toString() === userId
    )

    if (existingLikeIndex > -1) {
      // Unlike the post
      post.likes.splice(existingLikeIndex, 1)
    } else {
      // Like the post
      post.likes.push({ user: userId })
    }

    await post.save()

    return NextResponse.json({
      success: true,
      liked: existingLikeIndex === -1,
      likeCount: post.likes.length
    })
    
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}

// GET - Get likes for a post
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectMongoDB()
    
    const postId = params.id
    const post = await Post.findById(postId)
      .populate({
        path: 'likes.user',
        select: 'profile.firstName profile.lastName profile.avatar'
      })
      .select('likes')
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    const likes = post.likes.map((like: any) => ({
      user: {
        id: like.user._id,
        name: `${like.user.profile.firstName} ${like.user.profile.lastName}`,
        avatar: like.user.profile.avatar
      },
      createdAt: like.createdAt
    }))

    return NextResponse.json({
      success: true,
      likes,
      likeCount: likes.length
    })
    
  } catch (error) {
    console.error('Error fetching likes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch likes' },
      { status: 500 }
    )
  }
}