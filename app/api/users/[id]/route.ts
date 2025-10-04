import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { verifyToken } from '@/lib/auth-middleware'
import type { UserProfile } from '@/lib/models/User'

// GET - Fetch user profile by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase()
    const userId = params.id
    
    // Verify the requesting user
    const tokenPayload = await verifyToken(request)
    const requestingUserId = tokenPayload?.userId

    // Validate ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Find the target user
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId), isActive: true },
      {
        projection: {
          password: 0, // Never return password
          'preferences.notifications': 0, // Don't expose notification preferences
          'verification': 0, // Don't expose verification details
          'bankDetails': 0 // Don't expose sensitive financial info
        }
      }
    )

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Initialize default values for new social fields if they don't exist
    const socialProfile = user.socialProfile || {
      bio: '',
      coverImage: '',
      socialLinks: {},
      achievements: [],
      skills: [],
      experienceLevel: 'beginner',
      profileViews: 0,
      helpfulAnswers: 0
    }

    const privacySettings = user.privacySettings || {
      profileVisibility: 'public',
      postVisibility: 'public',
      contactInfoVisibility: 'connections',
      showConnectionsList: true,
      allowConnectionRequests: true,
      allowFollowers: true
    }

    const socialStats = user.socialStats || {
      postsCount: 0,
      connectionsCount: 0,
      followersCount: 0,
      followingCount: 0
    }

    // Check privacy settings and relationship status
    let connectionStatus: 'none' | 'pending' | 'accepted' | 'blocked' = 'none'
    let isFollowing = false
    let isFollowed = false
    let mutualConnectionsCount = 0
    
    if (requestingUserId && requestingUserId !== userId) {
      // Check connection status
      const connection = user.connections?.find((conn: any) => 
        conn.user.toString() === requestingUserId
      )
      connectionStatus = connection ? connection.status : 'none'
      
      // Check following status
      isFollowing = user.followers?.some((follower: any) => 
        follower.user.toString() === requestingUserId
      ) || false
      
      isFollowed = user.following?.some((following: any) => 
        following.user.toString() === requestingUserId
      ) || false

      // Calculate mutual connections
      if (requestingUserId !== userId) {
        const requestingUser = await db.collection('users').findOne(
          { _id: new ObjectId(requestingUserId) },
          { projection: { connections: 1 } }
        )
        
        if (requestingUser?.connections && user.connections) {
          const requestingUserConnections = requestingUser.connections
            .filter((conn: any) => conn.status === 'accepted')
            .map((conn: any) => conn.user.toString())
            
          const userConnections = user.connections
            .filter((conn: any) => conn.status === 'accepted')
            .map((conn: any) => conn.user.toString())
            
          mutualConnectionsCount = requestingUserConnections.filter((connId: string) => 
            userConnections.includes(connId)
          ).length
        }
      }

      // Increment profile view if different user
      if (requestingUserId !== userId) {
        await db.collection('users').updateOne(
          { _id: new ObjectId(userId) },
          { $inc: { 'socialProfile.profileViews': 1 } }
        )
      }
    }

    // Determine what the requesting user can see based on privacy settings
    const canViewProfile = checkProfileVisibility(privacySettings.profileVisibility, connectionStatus, requestingUserId, userId)
    const canViewPosts = checkPostVisibility(privacySettings.postVisibility, connectionStatus, isFollowing, requestingUserId, userId)
    const canViewContactInfo = checkContactInfoVisibility(privacySettings.contactInfoVisibility, connectionStatus, requestingUserId, userId)

    if (!canViewProfile) {
      return NextResponse.json(
        { success: false, error: 'Profile is private' },
        { status: 403 }
      )
    }

    // Build the response profile
    const profile: UserProfile = {
      _id: user._id,
      email: canViewContactInfo ? user.email : undefined,
      profile: {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        phone: canViewContactInfo ? user.profile.phone : '',
        avatar: user.profile.avatar,
        location: {
          governorate: user.profile.location.governorate,
          city: user.profile.location.city,
          address: canViewContactInfo ? user.profile.location.address : '',
          coordinates: user.profile.location.coordinates
        },
        dateOfBirth: canViewContactInfo ? user.profile.dateOfBirth : undefined,
        gender: user.profile.gender,
        languages: user.profile.languages || [],
        interests: user.profile.interests || []
      },
      socialProfile,
      socialStats,
      role: user.role,
      connectionStatus,
      isFollowing,
      isFollowed,
      mutualConnections: mutualConnectionsCount,
      canViewProfile,
      canViewPosts,
      canViewContactInfo,
      createdAt: user.createdAt ? user.createdAt.toISOString() : undefined
    }

    // Add role-specific profiles if visible
    if (canViewProfile) {
      if (user.farmerProfile) {
        profile.farmerProfile = {
          ...user.farmerProfile,
          bankDetails: undefined // Never expose bank details
        }
      }
      if (user.buyerProfile) {
        profile.buyerProfile = user.buyerProfile
      }
      if (user.supplierProfile) {
        profile.supplierProfile = user.supplierProfile
      }
    }

    return NextResponse.json({
      success: true,
      profile
    })

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions for privacy checks
function checkProfileVisibility(
  visibility: string, 
  connectionStatus: string, 
  requestingUserId?: string, 
  targetUserId?: string
): boolean {
  if (!requestingUserId || requestingUserId === targetUserId) return true
  
  switch (visibility) {
    case 'public':
      return true
    case 'connections':
      return connectionStatus === 'accepted'
    case 'private':
      return false
    default:
      return true
  }
}

function checkPostVisibility(
  visibility: string, 
  connectionStatus: string, 
  isFollowing: boolean,
  requestingUserId?: string, 
  targetUserId?: string
): boolean {
  if (!requestingUserId || requestingUserId === targetUserId) return true
  
  switch (visibility) {
    case 'public':
      return true
    case 'connections':
      return connectionStatus === 'accepted'
    case 'followers':
      return isFollowing || connectionStatus === 'accepted'
    case 'private':
      return false
    default:
      return true
  }
}

function checkContactInfoVisibility(
  visibility: string, 
  connectionStatus: string, 
  requestingUserId?: string, 
  targetUserId?: string
): boolean {
  if (!requestingUserId || requestingUserId === targetUserId) return true
  
  switch (visibility) {
    case 'public':
      return true
    case 'connections':
      return connectionStatus === 'accepted'
    case 'private':
      return false
    default:
      return false
  }
}