import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { verifyToken } from '@/lib/auth-middleware'

// GET - Get user's connections
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const targetUserId = params.id
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'connections' // connections, followers, following
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Verify the requesting user
    const tokenPayload = await verifyToken(request)
    const requestingUserId = tokenPayload?.userId

    // Validate ObjectId
    if (!ObjectId.isValid(targetUserId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Get the target user
    const targetUser = await db.collection('users').findOne(
      { _id: new ObjectId(targetUserId), isActive: true },
      { projection: { connections: 1, followers: 1, following: 1, privacySettings: 1 } }
    )

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check privacy settings
    const privacySettings = targetUser.privacySettings || { showConnectionsList: true }
    
    // Only allow viewing connections if:
    // 1. It's the user's own profile
    // 2. The user allows showing connections list
    // 3. The requesting user is connected to the target user
    const isOwnProfile = requestingUserId === targetUserId
    const canViewConnections = isOwnProfile || privacySettings.showConnectionsList
    
    if (!canViewConnections && type === 'connections') {
      // Check if they are connected
      const connection = targetUser.connections?.find((conn: any) => 
        conn.user.toString() === requestingUserId && conn.status === 'accepted'
      )
      
      if (!connection) {
        return NextResponse.json(
          { success: false, error: 'Connections list is private' },
          { status: 403 }
        )
      }
    }

    let userIds: string[] = []
    let totalCount = 0

    switch (type) {
      case 'connections':
        const connections = targetUser.connections?.filter((conn: any) => conn.status === 'accepted') || []
        totalCount = connections.length
        userIds = connections
          .slice((page - 1) * limit, page * limit)
          .map((conn: any) => conn.user.toString())
        break

      case 'followers':
        const followers = targetUser.followers || []
        totalCount = followers.length
        userIds = followers
          .slice((page - 1) * limit, page * limit)
          .map((follower: any) => follower.user.toString())
        break

      case 'following':
        const following = targetUser.following || []
        totalCount = following.length
        userIds = following
          .slice((page - 1) * limit, page * limit)
          .map((follow: any) => follow.user.toString())
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type. Use connections, followers, or following' },
          { status: 400 }
        )
    }

    // Get user details for the connections/followers/following
    const users = await db.collection('users')
      .find(
        { 
          _id: { $in: userIds.map(id => new ObjectId(id)) },
          isActive: true 
        },
        {
          projection: {
            'profile.firstName': 1,
            'profile.lastName': 1,
            'profile.avatar': 1,
            'profile.location.governorate': 1,
            'profile.location.city': 1,
            'socialProfile.bio': 1,
            'socialStats': 1,
            'role': 1
          }
        }
      )
      .toArray()

    // Transform the results
    const result = users.map(user => ({
      _id: user._id,
      profile: {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        avatar: user.profile.avatar,
        location: {
          governorate: user.profile.location?.governorate,
          city: user.profile.location?.city
        }
      },
      socialProfile: {
        bio: user.socialProfile?.bio
      },
      socialStats: user.socialStats || {
        postsCount: 0,
        connectionsCount: 0,
        followersCount: 0,
        followingCount: 0
      },
      role: user.role
    }))

    return NextResponse.json({
      success: true,
      [type]: result,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}