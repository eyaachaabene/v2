import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { verifyToken } from '@/lib/auth-middleware'

// POST - Send, accept, decline, or remove connection request
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase()
    const targetUserId = params.id
    const { action, message } = await request.json()
    
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
        { success: false, error: 'Cannot connect to yourself' },
        { status: 400 }
      )
    }

    const validActions = ['send', 'accept', 'decline', 'remove', 'block', 'unblock']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
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

    // Check if target user allows connection requests
    const targetPrivacySettings = targetUser.privacySettings || { allowConnectionRequests: true }
    if (!targetPrivacySettings.allowConnectionRequests && action === 'send') {
      return NextResponse.json(
        { success: false, error: 'User does not accept connection requests' },
        { status: 403 }
      )
    }

    // Initialize connections array if it doesn't exist
    const requestingUserConnections = requestingUser.connections || []
    const targetUserConnections = targetUser.connections || []

    // Find existing connection
    const existingConnectionFromRequesting = requestingUserConnections.find(
      (conn: any) => conn.user.toString() === targetUserId
    )
    const existingConnectionFromTarget = targetUserConnections.find(
      (conn: any) => conn.user.toString() === requestingUserId
    )

    let result: any = { success: true }

    switch (action) {
      case 'send':
        // Check if connection already exists
        if (existingConnectionFromRequesting) {
          return NextResponse.json(
            { success: false, error: 'Connection already exists' },
            { status: 400 }
          )
        }

        // INSTANT FRIENDSHIP: Add both users as friends immediately
        await Promise.all([
          // Add to requesting user's friends and connections
          db.collection('users').updateOne(
            { _id: new ObjectId(requestingUserId) },
            {
              $push: {
                friends: {
                  user: new ObjectId(targetUserId),
                  addedAt: new Date(),
                  unreadMessages: 0
                } as any,
                connections: {
                  user: new ObjectId(targetUserId),
                  status: 'accepted',
                  connectedAt: new Date(),
                  requestedBy: new ObjectId(requestingUserId)
                } as any
              },
              $inc: { 
                'socialStats.friendsCount': 1,
                'socialStats.connectionsCount': 1 
              }
            }
          ),
          // Add to target user's friends and connections
          db.collection('users').updateOne(
            { _id: new ObjectId(targetUserId) },
            {
              $push: {
                friends: {
                  user: new ObjectId(requestingUserId),
                  addedAt: new Date(),
                  unreadMessages: 0
                } as any,
                connections: {
                  user: new ObjectId(requestingUserId),
                  status: 'accepted',
                  connectedAt: new Date(),
                  requestedBy: new ObjectId(requestingUserId)
                } as any
              },
              $inc: { 
                'socialStats.friendsCount': 1,
                'socialStats.connectionsCount': 1 
              }
            }
          )
        ])

        result.message = 'You are now friends! You can send messages to each other.'
        result.isFriend = true
        break

      case 'accept':
        // Check if there's a pending connection request
        if (!existingConnectionFromRequesting || existingConnectionFromRequesting.status !== 'pending') {
          return NextResponse.json(
            { success: false, error: 'No pending connection request found' },
            { status: 400 }
          )
        }

        // Only the target of the request can accept
        if (existingConnectionFromRequesting.requestedBy.toString() === requestingUserId) {
          return NextResponse.json(
            { success: false, error: 'Cannot accept your own connection request' },
            { status: 400 }
          )
        }

        // Update both users' connections to accepted
        await Promise.all([
          db.collection('users').updateOne(
            { 
              _id: new ObjectId(requestingUserId),
              'connections.user': new ObjectId(targetUserId)
            },
            {
              $set: {
                'connections.$.status': 'accepted',
                'connections.$.connectedAt': new Date()
              },
              $inc: { 'socialStats.connectionsCount': 1 }
            }
          ),
          db.collection('users').updateOne(
            { 
              _id: new ObjectId(targetUserId),
              'connections.user': new ObjectId(requestingUserId)
            },
            {
              $set: {
                'connections.$.status': 'accepted',
                'connections.$.connectedAt': new Date()
              },
              $inc: { 'socialStats.connectionsCount': 1 }
            }
          )
        ])

        result.message = 'Connection request accepted'
        break

      case 'decline':
        // Remove the connection from both users
        await Promise.all([
          db.collection('users').updateOne(
            { _id: new ObjectId(requestingUserId) },
            { $pull: { connections: { user: new ObjectId(targetUserId) } as any } }
          ),
          db.collection('users').updateOne(
            { _id: new ObjectId(targetUserId) },
            { $pull: { connections: { user: new ObjectId(requestingUserId) } as any } }
          )
        ])

        result.message = 'Connection request declined'
        break

      case 'remove':
        // Remove the friendship and connection from both users
        const wasAccepted = existingConnectionFromRequesting?.status === 'accepted'
        
        await Promise.all([
          db.collection('users').updateOne(
            { _id: new ObjectId(requestingUserId) },
            { 
              $pull: { 
                connections: { user: new ObjectId(targetUserId) } as any,
                friends: { user: new ObjectId(targetUserId) } as any
              },
              $inc: { 
                'socialStats.connectionsCount': wasAccepted ? -1 : 0,
                'socialStats.friendsCount': -1
              }
            }
          ),
          db.collection('users').updateOne(
            { _id: new ObjectId(targetUserId) },
            { 
              $pull: { 
                connections: { user: new ObjectId(requestingUserId) } as any,
                friends: { user: new ObjectId(requestingUserId) } as any
              },
              $inc: { 
                'socialStats.connectionsCount': wasAccepted ? -1 : 0,
                'socialStats.friendsCount': -1
              }
            }
          )
        ])

        result.message = 'Friend removed'
        result.isFriend = false
        break

      case 'block':
        // Update existing connection to blocked or create new blocked connection
        if (existingConnectionFromRequesting) {
          await db.collection('users').updateOne(
            { 
              _id: new ObjectId(requestingUserId),
              'connections.user': new ObjectId(targetUserId)
            },
            { $set: { 'connections.$.status': 'blocked' } }
          )
        } else {
          await db.collection('users').updateOne(
            { _id: new ObjectId(requestingUserId) },
            {
              $push: {
                connections: {
                  user: new ObjectId(targetUserId),
                  status: 'blocked',
                  connectedAt: new Date(),
                  requestedBy: new ObjectId(requestingUserId)
                }
              } as any
            }
          )
        }

        result.message = 'User blocked'
        break

      case 'unblock':
        // Remove the blocked connection
        await db.collection('users').updateOne(
          { _id: new ObjectId(requestingUserId) },
          { $pull: { connections: { user: new ObjectId(targetUserId) } } as any }
        )

        result.message = 'User unblocked'
        break
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error managing connection:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}