import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { verifyToken } from '@/lib/auth-middleware'

// POST - Follow or unfollow a user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const targetUserId = params.id
    const { action } = await request.json()
    
    // Verify the requesting user
    const tokenPayload = await verifyToken(request)
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const requestingUserId = tokenPayload.userId

    // Validate inputs
    if (!ObjectId.isValid(targetUserId) || !ObjectId.isValid(requestingUserId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    if (requestingUserId === targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    const validActions = ['follow', 'unfollow']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "follow" or "unfollow"' },
        { status: 400 }
      )
    }

    // Get both users
    const [requestingUser, targetUser] = await Promise.all([
      db.collection('users').findOne({ _id: new ObjectId(requestingUserId), isActive: true }),
      db.collection('users').findOne({ _id: new ObjectId(targetUserId), isActive: true })
    ])

    if (!requestingUser || !targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if target user allows followers
    const targetPrivacySettings = targetUser.privacySettings || { allowFollowers: true }
    if (!targetPrivacySettings.allowFollowers && action === 'follow') {
      return NextResponse.json(
        { success: false, error: 'User does not allow followers' },
        { status: 403 }
      )
    }

    // Initialize arrays if they don't exist
    const requestingUserFollowing = requestingUser.following || []
    const targetUserFollowers = targetUser.followers || []

    // Check if already following
    const isAlreadyFollowing = requestingUserFollowing.some(
      (follow: any) => follow.user.toString() === targetUserId
    )

    let result: any = { success: true }

    if (action === 'follow') {
      if (isAlreadyFollowing) {
        return NextResponse.json(
          { success: false, error: 'Already following this user' },
          { status: 400 }
        )
      }

      // Add to requesting user's following list and target user's followers list
      await Promise.all([
        db.collection('users').updateOne(
          { _id: new ObjectId(requestingUserId) },
          {
            $push: {
              following: {
                user: new ObjectId(targetUserId),
                followedAt: new Date()
              }
            },
            $inc: { 'socialStats.followingCount': 1 }
          }
        ),
        db.collection('users').updateOne(
          { _id: new ObjectId(targetUserId) },
          {
            $push: {
              followers: {
                user: new ObjectId(requestingUserId),
                followedAt: new Date()
              }
            },
            $inc: { 'socialStats.followersCount': 1 }
          }
        )
      ])

      result.message = 'Successfully followed user'
      result.isFollowing = true

    } else if (action === 'unfollow') {
      if (!isAlreadyFollowing) {
        return NextResponse.json(
          { success: false, error: 'Not following this user' },
          { status: 400 }
        )
      }

      // Remove from requesting user's following list and target user's followers list
      await Promise.all([
        db.collection('users').updateOne(
          { _id: new ObjectId(requestingUserId) },
          {
            $pull: { following: { user: new ObjectId(targetUserId) } },
            $inc: { 'socialStats.followingCount': -1 }
          }
        ),
        db.collection('users').updateOne(
          { _id: new ObjectId(targetUserId) },
          {
            $pull: { followers: { user: new ObjectId(requestingUserId) } },
            $inc: { 'socialStats.followersCount': -1 }
          }
        )
      ])

      result.message = 'Successfully unfollowed user'
      result.isFollowing = false
    }

    // TODO: Create notification for new follower (if following)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error managing follow:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}