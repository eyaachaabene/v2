import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { verifyToken } from '@/lib/auth-middleware'

// GET - Get current user's full profile for editing
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

    // Get user's full profile (they can see everything about themselves)
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId), isActive: true },
      {
        projection: {
          password: 0, // Never return password
        }
      }
    )

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: user
    })

  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const db = await getDatabase()
    const updates = await request.json()
    
    // Verify the requesting user
    const tokenPayload = await verifyToken(request)
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const userId = tokenPayload.userId

    // Validate and sanitize the updates
    const allowedUpdates = [
      'profile',
      'socialProfile',
      'privacySettings',
      'farmerProfile',
      'buyerProfile',
      'supplierProfile',
      'preferences'
    ]

    const updateDoc: any = {}

    // Process each allowed update field
    for (const field of allowedUpdates) {
      if (updates[field]) {
        switch (field) {
          case 'profile':
            updateDoc.profile = {
              ...updates.profile,
              // Ensure required fields are present
              firstName: updates.profile.firstName?.trim(),
              lastName: updates.profile.lastName?.trim(),
              phone: updates.profile.phone?.trim(),
              avatar: updates.profile.avatar,
              location: {
                governorate: updates.profile.location?.governorate?.trim(),
                city: updates.profile.location?.city?.trim(),
                address: updates.profile.location?.address?.trim(),
                coordinates: updates.profile.location?.coordinates
              },
              dateOfBirth: updates.profile.dateOfBirth,
              gender: updates.profile.gender,
              languages: Array.isArray(updates.profile.languages) ? updates.profile.languages : [],
              interests: Array.isArray(updates.profile.interests) ? updates.profile.interests : []
            }
            break

          case 'socialProfile':
            updateDoc.socialProfile = {
              bio: updates.socialProfile.bio?.trim()?.substring(0, 500) || '', // Limit bio to 500 chars
              coverImage: updates.socialProfile.coverImage,
              socialLinks: {
                facebook: updates.socialProfile.socialLinks?.facebook,
                twitter: updates.socialProfile.socialLinks?.twitter,
                linkedin: updates.socialProfile.socialLinks?.linkedin,
                instagram: updates.socialProfile.socialLinks?.instagram,
                website: updates.socialProfile.socialLinks?.website
              },
              achievements: Array.isArray(updates.socialProfile.achievements) 
                ? updates.socialProfile.achievements 
                : [],
              skills: Array.isArray(updates.socialProfile.skills) 
                ? updates.socialProfile.skills.map((skill: string) => skill.trim()).filter(Boolean)
                : [],
              experienceLevel: ['beginner', 'intermediate', 'advanced', 'expert'].includes(updates.socialProfile.experienceLevel)
                ? updates.socialProfile.experienceLevel
                : 'beginner',
              // Don't allow manual updates to profileViews and helpfulAnswers
              profileViews: undefined,
              helpfulAnswers: undefined
            }
            
            // Remove undefined values
            Object.keys(updateDoc.socialProfile).forEach(key => {
              if (updateDoc.socialProfile[key] === undefined) {
                delete updateDoc.socialProfile[key]
              }
            })
            break

          case 'privacySettings':
            updateDoc.privacySettings = {
              profileVisibility: ['public', 'connections', 'private'].includes(updates.privacySettings.profileVisibility)
                ? updates.privacySettings.profileVisibility
                : 'public',
              postVisibility: ['public', 'connections', 'followers', 'private'].includes(updates.privacySettings.postVisibility)
                ? updates.privacySettings.postVisibility
                : 'public',
              contactInfoVisibility: ['public', 'connections', 'private'].includes(updates.privacySettings.contactInfoVisibility)
                ? updates.privacySettings.contactInfoVisibility
                : 'connections',
              showConnectionsList: Boolean(updates.privacySettings.showConnectionsList),
              allowConnectionRequests: Boolean(updates.privacySettings.allowConnectionRequests),
              allowFollowers: Boolean(updates.privacySettings.allowFollowers)
            }
            break

          case 'farmerProfile':
            if (updates[field]) {
              updateDoc.farmerProfile = {
                farmName: updates.farmerProfile.farmName?.trim(),
                farmSize: Number(updates.farmerProfile.farmSize) || 0,
                farmingExperience: Number(updates.farmerProfile.farmingExperience) || 0,
                specializations: Array.isArray(updates.farmerProfile.specializations) 
                  ? updates.farmerProfile.specializations 
                  : [],
                certifications: Array.isArray(updates.farmerProfile.certifications) 
                  ? updates.farmerProfile.certifications 
                  : [],
                farmLocation: updates.farmerProfile.farmLocation,
                // Don't allow updating bankDetails through this endpoint for security
                bankDetails: undefined
              }
              
              // Remove undefined values
              Object.keys(updateDoc.farmerProfile).forEach(key => {
                if (updateDoc.farmerProfile[key] === undefined) {
                  delete updateDoc.farmerProfile[key]
                }
              })
            }
            break

          case 'buyerProfile':
          case 'supplierProfile':
            if (updates[field]) {
              updateDoc[field] = updates[field]
            }
            break

          case 'preferences':
            updateDoc.preferences = {
              notifications: {
                email: Boolean(updates.preferences.notifications?.email),
                sms: Boolean(updates.preferences.notifications?.sms),
                push: Boolean(updates.preferences.notifications?.push),
                connectionRequests: Boolean(updates.preferences.notifications?.connectionRequests),
                newFollowers: Boolean(updates.preferences.notifications?.newFollowers),
                postLikes: Boolean(updates.preferences.notifications?.postLikes),
                postComments: Boolean(updates.preferences.notifications?.postComments)
              },
              language: updates.preferences.language || 'en',
              currency: updates.preferences.currency || 'TND'
            }
            break
        }
      }
    }

    // Validate required fields if profile is being updated
    if (updateDoc.profile) {
      if (!updateDoc.profile.firstName || !updateDoc.profile.lastName) {
        return NextResponse.json(
          { success: false, error: 'First name and last name are required' },
          { status: 400 }
        )
      }
    }

    // Update the user document
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: updateDoc,
        $currentDate: { updatedAt: true }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get the updated user profile
    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    )

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedUser
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}