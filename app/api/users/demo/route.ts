import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

// GET - Get all users for development/testing
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    
    // Get first 10 users for demo purposes
    const users = await db.collection('users')
      .find(
        { isActive: true },
        {
          projection: {
            _id: 1,
            'profile.firstName': 1,
            'profile.lastName': 1,
            'profile.avatar': 1,
            'profile.location': 1,
            'role': 1,
            'socialProfile.bio': 1
          }
        }
      )
      .limit(10)
      .toArray()

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user._id.toString(),
        name: `${user.profile?.firstName || 'Unknown'} ${user.profile?.lastName || 'User'}`,
        avatar: user.profile?.avatar || '/placeholder-user.jpg',
        location: user.profile?.location ? 
          `${user.profile.location.city || ''}, ${user.profile.location.governorate || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Tunisia'
          : 'Tunisia',
        role: user.role || 'farmer',
        bio: user.socialProfile?.bio || 'Passionate about agriculture and sustainable farming.'
      }))
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}