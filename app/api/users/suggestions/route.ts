import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { verifyToken } from '@/lib/auth-middleware'

// GET - Get suggested connections for the user
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

    // Get the current user's data
    const currentUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId), isActive: true },
      {
        projection: {
          profile: 1,
          role: 1,
          connections: 1,
          socialProfile: 1,
          farmerProfile: 1
        }
      }
    )

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get IDs of users already connected to or blocked by current user
    const connectedUserIds = (currentUser.connections || []).map((conn: any) => conn.user.toString())
    const excludedIds = [userId, ...connectedUserIds]

    // Build aggregation pipeline for suggestions
    const pipeline = [
      // Exclude current user and already connected users
      {
        $match: {
          _id: { $nin: excludedIds.map(id => new ObjectId(id)) },
          isActive: true
        }
      },
      
      // Calculate suggestion score based on multiple factors
      {
        $addFields: {
          suggestionScore: {
            $sum: [
              // Same location (governorate) - 10 points
              {
                $cond: {
                  if: { 
                    $eq: [
                      '$profile.location.governorate', 
                      currentUser.profile?.location?.governorate
                    ] 
                  },
                  then: 10,
                  else: 0
                }
              },
              
              // Same city - additional 5 points
              {
                $cond: {
                  if: { 
                    $eq: [
                      '$profile.location.city', 
                      currentUser.profile?.location?.city
                    ] 
                  },
                  then: 5,
                  else: 0
                }
              },
              
              // Same role - 5 points
              {
                $cond: {
                  if: { $eq: ['$role', currentUser.role] },
                  then: 5,
                  else: 0
                }
              },
              
              // Common interests - 2 points per match
              {
                $multiply: [
                  2,
                  {
                    $size: {
                      $setIntersection: [
                        { $ifNull: ['$profile.interests', []] },
                        currentUser.profile?.interests || []
                      ]
                    }
                  }
                ]
              },
              
              // Common farming specializations (for farmers) - 3 points per match
              {
                $cond: {
                  if: { $eq: ['$role', 'farmer'] },
                  then: {
                    $multiply: [
                      3,
                      {
                        $size: {
                          $setIntersection: [
                            { $ifNull: ['$farmerProfile.specializations', []] },
                            currentUser.farmerProfile?.specializations || []
                          ]
                        }
                      }
                    ]
                  },
                  else: 0
                }
              },
              
              // Random factor for diversity - 0-3 points
              { $mod: [{ $toInt: { $substr: [{ $toString: '$_id' }, 20, 4] } }, 4] }
            ]
          }
        }
      },
      
      // Sort by suggestion score (highest first)
      { $sort: { suggestionScore: -1 } },
      
      // Limit results
      { $limit: 20 },
      
      // Project only needed fields
      {
        $project: {
          'profile.firstName': 1,
          'profile.lastName': 1,
          'profile.avatar': 1,
          'profile.location.governorate': 1,
          'profile.location.city': 1,
          'profile.interests': 1,
          'socialProfile.bio': 1,
          'socialProfile.skills': 1,
          'socialStats': 1,
          'role': 1,
          'farmerProfile.specializations': 1,
          'suggestionScore': 1
        }
      }
    ]

    const suggestions = await db.collection('users').aggregate(pipeline).toArray()

    // Calculate additional data for each suggestion
    const enhancedSuggestions = await Promise.all(
      suggestions.map(async (user) => {
        // Calculate mutual connections
        const mutualConnections = await db.collection('users').countDocuments({
          _id: { $in: connectedUserIds.map(id => new ObjectId(id)) },
          'connections.user': user._id,
          'connections.status': 'accepted'
        })

        // Determine common tags/interests
        const commonTags = [
          ...(user.profile?.interests || []).filter((interest: string) => 
            (currentUser.profile?.interests || []).includes(interest)
          ),
          ...(user.farmerProfile?.specializations || []).filter((spec: string) => 
            (currentUser.farmerProfile?.specializations || []).includes(spec)
          )
        ]

        // Determine connection reason
        let connectionReason = 'Suggested for you'
        if (user.profile?.location?.governorate === currentUser.profile?.location?.governorate) {
          connectionReason = 'Same location'
        } else if (user.role === currentUser.role) {
          connectionReason = `Fellow ${user.role}`
        } else if (commonTags.length > 0) {
          connectionReason = 'Common interests'
        } else if (mutualConnections > 0) {
          connectionReason = 'Mutual connections'
        }

        return {
          ...user,
          mutualConnections,
          commonTags: commonTags.slice(0, 5), // Limit to 5 tags
          connectionReason,
          socialStats: user.socialStats || {
            postsCount: 0,
            connectionsCount: 0,
            followersCount: 0,
            followingCount: 0
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      suggestions: enhancedSuggestions
    })

  } catch (error) {
    console.error('Error fetching user suggestions:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}