import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { verifyToken } from '@/lib/auth-middleware'

// GET - Get connection requests (received and sent)
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    
    // Verify the requesting user
    const tokenPayload = await verifyToken(request)
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const userId = tokenPayload.userId

    // Get user's pending connections
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId), isActive: true },
      { projection: { connections: 1 } }
    )

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const pendingConnections = user.connections?.filter((conn: any) => conn.status === 'pending') || []

    // Separate received vs sent requests
    const receivedRequestIds = pendingConnections
      .filter((conn: any) => conn.requestedBy.toString() !== userId)
      .map((conn: any) => conn.user.toString())

    const sentRequestIds = pendingConnections
      .filter((conn: any) => conn.requestedBy.toString() === userId)
      .map((conn: any) => conn.user.toString())

    // Get user details for received requests
    const receivedUsers = receivedRequestIds.length > 0 ? await db.collection('users')
      .find(
        { 
          _id: { $in: receivedRequestIds.map((id: string) => new ObjectId(id)) },
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
      .toArray() : []

    // Get user details for sent requests
    const sentUsers = sentRequestIds.length > 0 ? await db.collection('users')
      .find(
        { 
          _id: { $in: sentRequestIds.map((id: string) => new ObjectId(id)) },
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
      .toArray() : []

    // Transform received requests
    const received = await Promise.all(receivedUsers.map(async (userDoc) => {
      const connectionData = pendingConnections.find((conn: any) => conn.user.toString() === userDoc._id.toString())
      
      // Calculate mutual connections
      const userConnections = userDoc.connections?.filter((conn: any) => conn.status === 'accepted').map((conn: any) => conn.user.toString()) || []
      const myConnections = user.connections?.filter((conn: any) => conn.status === 'accepted').map((conn: any) => conn.user.toString()) || []
      const mutualConnections = userConnections.filter((connId: string) => myConnections.includes(connId)).length

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
        requestedBy: connectionData?.requestedBy,
        message: connectionData?.message,
        requestedAt: connectionData?.connectedAt
      }
    }))

    // Transform sent requests
    const sent = await Promise.all(sentUsers.map(async (userDoc) => {
      const connectionData = pendingConnections.find((conn: any) => conn.user.toString() === userDoc._id.toString())
      
      // Calculate mutual connections
      const userConnections = userDoc.connections?.filter((conn: any) => conn.status === 'accepted').map((conn: any) => conn.user.toString()) || []
      const myConnections = user.connections?.filter((conn: any) => conn.status === 'accepted').map((conn: any) => conn.user.toString()) || []
      const mutualConnections = userConnections.filter((connId: string) => myConnections.includes(connId)).length

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
        requestedBy: connectionData?.requestedBy,
        message: connectionData?.message,
        requestedAt: connectionData?.connectedAt
      }
    }))

    return NextResponse.json({
      success: true,
      received,
      sent,
      counts: {
        received: received.length,
        sent: sent.length,
        total: received.length + sent.length
      }
    })

  } catch (error) {
    console.error('Error fetching connection requests:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}