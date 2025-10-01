import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { verifyToken } from '@/lib/auth-middleware'

// GET - Get user's friends list
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

    // Get user's friends
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId), isActive: true },
      { projection: { friends: 1 } }
    )

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const friends = user.friends || []
    
    if (friends.length === 0) {
      return NextResponse.json({
        success: true,
        friends: [],
        count: 0
      })
    }

    // Get friend details
    const friendIds = friends.map((friend: any) => friend.user)
    const friendsData = await db.collection('users')
      .find(
        { 
          _id: { $in: friendIds },
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
            'role': 1,
            'lastLogin': 1
          }
        }
      )
      .toArray()

    // Combine friend data with friend metadata
    const friendsList = friendsData.map((friendDoc) => {
      const friendMeta = friends.find((f: any) => f.user.toString() === friendDoc._id.toString())
      
      return {
        _id: friendDoc._id,
        profile: {
          firstName: friendDoc.profile.firstName,
          lastName: friendDoc.profile.lastName,
          avatar: friendDoc.profile.avatar,
          location: {
            governorate: friendDoc.profile.location?.governorate,
            city: friendDoc.profile.location?.city
          }
        },
        socialProfile: {
          bio: friendDoc.socialProfile?.bio
        },
        role: friendDoc.role,
        addedAt: friendMeta?.addedAt,
        lastMessageAt: friendMeta?.lastMessageAt,
        unreadMessages: friendMeta?.unreadMessages || 0,
        lastLogin: friendDoc.lastLogin,
        isOnline: friendDoc.lastLogin && new Date().getTime() - new Date(friendDoc.lastLogin).getTime() < 5 * 60 * 1000 // 5 minutes
      }
    })

    // Sort by last message time, then by added time
    friendsList.sort((a, b) => {
      if (a.lastMessageAt && b.lastMessageAt) {
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      }
      if (a.lastMessageAt) return -1
      if (b.lastMessageAt) return 1
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    })

    return NextResponse.json({
      success: true,
      friends: friendsList,
      count: friendsList.length
    })

  } catch (error) {
    console.error('Error fetching friends list:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}