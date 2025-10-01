import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { verifyToken } from '@/lib/auth-middleware'

// GET - Get user's connections, followers, or following list
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'connections' // connections, followers, following
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Verify the requesting user
    const tokenPayload = await verifyToken(request)
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const userId = tokenPayload.userId

    // Get the user's data
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId), isActive: true },
      { projection: { connections: 1, followers: 1, following: 1 } }
    )

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    let userIds: string[] = []
    let totalCount = 0

    switch (type) {
      case 'connections':
        const connections = user.connections?.filter((conn: any) => conn.status === 'accepted') || []
        totalCount = connections.length
        userIds = connections
          .slice((page - 1) * limit, page * limit)
          .map((conn: any) => conn.user.toString())
        break

      case 'followers':
        const followers = user.followers || []
        totalCount = followers.length
        userIds = followers
          .slice((page - 1) * limit, page * limit)
          .map((follower: any) => follower.user.toString())
        break

      case 'following':
        const following = user.following || []
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
            'role': 1,
            'connections': 1
          }
        }
      )
      .toArray()

    // Transform the results and calculate mutual connections
    const result = await Promise.all(users.map(async (userDoc) => {
      // Calculate mutual connections
      const userConnections = userDoc.connections?.filter((conn: any) => conn.status === 'accepted').map((conn: any) => conn.user.toString()) || []
      const myConnections = user.connections?.filter((conn: any) => conn.status === 'accepted').map((conn: any) => conn.user.toString()) || []
      const mutualConnections = userConnections.filter(connId => myConnections.includes(connId)).length

      // Get connection date
      let connectedAt, followedAt
      if (type === 'connections') {
        const connection = user.connections?.find((conn: any) => conn.user.toString() === userDoc._id.toString())
        connectedAt = connection?.connectedAt
      } else if (type === 'followers') {
        const follower = user.followers?.find((follower: any) => follower.user.toString() === userDoc._id.toString())
        followedAt = follower?.followedAt
      } else if (type === 'following') {
        const following = user.following?.find((following: any) => following.user.toString() === userDoc._id.toString())
        followedAt = following?.followedAt
      }

      return {
        _id: userDoc._id,
        profile: {
          firstName: userDoc.profile.firstName,
          lastName: userDoc.profile.lastName,
          avatar: userDoc.profile.avatar,
          location: {
            governorate: userDoc.profile.location?.governorate,
            city: userDoc.profile.location?.city
          }
        },
        socialProfile: {
          bio: userDoc.socialProfile?.bio
        },
        socialStats: userDoc.socialStats || {
          postsCount: 0,
          connectionsCount: 0,
          followersCount: 0,
          followingCount: 0
        },
        role: userDoc.role,
        mutualConnections,
        connectedAt,
        followedAt
      }
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
    console.error('Error fetching connections list:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}