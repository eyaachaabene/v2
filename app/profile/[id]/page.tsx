"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { 
  MapPin, 
  Users, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  UserMinus, 
  Link as LinkIcon,
  Calendar,
  Mail,
  Phone,
  Globe,
  Award,
  Briefcase,
  Loader2,
  MoreHorizontal,
  Settings,
  Share2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUserProfile } from '@/hooks/use-user-profile'
import { useAuth } from '@/hooks/use-auth'

interface ProfilePageProps {}

export default function ProfilePage({}: ProfilePageProps) {
  const params = useParams()
  const userId = params.id as string
  const { user: currentUser } = useAuth()
  
  const {
    profile,
    loading,
    error,
    connectionStatus,
    isFollowing,
    mutualConnections,
    sendConnectionRequest,
    acceptConnectionRequest,
    removeConnection,
    followUser,
    unfollowUser,
    canViewProfile,
    canViewPosts,
    canViewContactInfo
  } = useUserProfile(userId)

  const [activeTab, setActiveTab] = useState('overview')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const isOwnProfile = currentUser?.id === userId

  // Handle connection actions
  const handleConnectionAction = async (action: string) => {
    setActionLoading(action)
    try {
      switch (action) {
        case 'connect':
          await sendConnectionRequest()
          break
        case 'accept':
          await acceptConnectionRequest()
          break
        case 'remove':
          await removeConnection()
          break
        case 'follow':
          await followUser()
          break
        case 'unfollow':
          await unfollowUser()
          break
      }
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground">{error || 'This profile is not available.'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!canViewProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Private Profile</h2>
            <p className="text-muted-foreground">
              This profile is private and you don't have permission to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const fullName = `${profile.profile.firstName} ${profile.profile.lastName}`
  const location = `${profile.profile.location?.city || ''}, ${profile.profile.location?.governorate || ''}`.replace(/^,\s*|,\s*$/g, '')

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <Card className="mb-6">
        <div className="relative h-48 bg-gradient-to-r from-green-400 to-blue-500 rounded-t-lg">
          {profile.socialProfile?.coverImage && (
            <Image
              src={profile.socialProfile.coverImage}
              alt="Cover"
              fill
              className="object-cover rounded-t-lg"
            />
          )}
          <div className="absolute inset-0 bg-black/20 rounded-t-lg" />
        </div>
        
        <CardContent className="relative">
          {/* Profile Picture */}
          <div className="absolute -top-16 left-6">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={profile.profile.avatar} alt={fullName} />
              <AvatarFallback className="text-2xl">
                {profile.profile.firstName[0]}{profile.profile.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="pt-20 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{fullName}</h1>
                  <Badge variant="secondary">{profile.role}</Badge>
                  {connectionStatus === 'accepted' && (
                    <Badge variant="outline" className="text-green-600">
                      <Users className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>

                {profile.socialProfile?.bio && (
                  <p className="text-muted-foreground mb-3">{profile.socialProfile.bio}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {location}
                    </div>
                  )}
                  
                  {mutualConnections > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {mutualConnections} mutual connections
                    </div>
                  )}

                  {canViewContactInfo && profile.profile.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {profile.profile.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex gap-2">
                  {/* Connection Button */}
                  {connectionStatus === 'none' && (
                    <Button 
                      onClick={() => handleConnectionAction('connect')}
                      disabled={actionLoading === 'connect'}
                    >
                      {actionLoading === 'connect' ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      Connect
                    </Button>
                  )}

                  {connectionStatus === 'pending' && (
                    <Button variant="outline" disabled>
                      Request Sent
                    </Button>
                  )}

                  {connectionStatus === 'accepted' && (
                    <Button 
                      variant="outline"
                      onClick={() => handleConnectionAction('remove')}
                      disabled={actionLoading === 'remove'}
                    >
                      {actionLoading === 'remove' ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <UserMinus className="w-4 h-4 mr-2" />
                      )}
                      Connected
                    </Button>
                  )}

                  {/* Follow Button */}
                  <Button 
                    variant={isFollowing ? "outline" : "default"}
                    onClick={() => handleConnectionAction(isFollowing ? 'unfollow' : 'follow')}
                    disabled={actionLoading === (isFollowing ? 'unfollow' : 'follow')}
                  >
                    {actionLoading === (isFollowing ? 'unfollow' : 'follow') ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                    )}
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>

                  {/* Message Button */}
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>

                  {/* More Actions */}
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {isOwnProfile && (
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{profile.socialStats.postsCount}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{profile.socialStats.connectionsCount}</div>
            <div className="text-sm text-muted-foreground">Connections</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{profile.socialStats.followersCount}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{profile.socialProfile?.helpfulAnswers || 0}</div>
            <div className="text-sm text-muted-foreground">Helpful Answers</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Posts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  {canViewPosts ? (
                    <p className="text-muted-foreground">Posts will be displayed here...</p>
                  ) : (
                    <p className="text-muted-foreground">This user's posts are private.</p>
                  )}
                </CardContent>
              </Card>

              {/* Achievements */}
              {profile.socialProfile?.achievements && profile.socialProfile.achievements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile.socialProfile.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Award className="w-8 h-8 text-yellow-500" />
                          <div>
                            <h4 className="font-medium">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              {canViewContactInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile.profile.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{profile.profile.phone}</span>
                      </div>
                    )}
                    
                    {profile.socialProfile?.socialLinks?.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a 
                          href={profile.socialProfile.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              {profile.socialProfile?.skills && profile.socialProfile.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Skills & Expertise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.socialProfile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Role-specific Info */}
              {profile.farmerProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle>Farm Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium">Farm Name:</span>
                      <p>{profile.farmerProfile.farmName}</p>
                    </div>
                    <div>
                      <span className="font-medium">Farm Size:</span>
                      <p>{profile.farmerProfile.farmSize} hectares</p>
                    </div>
                    <div>
                      <span className="font-medium">Experience:</span>
                      <p>{profile.farmerProfile.farmingExperience} years</p>
                    </div>
                    {profile.farmerProfile.specializations && profile.farmerProfile.specializations.length > 0 && (
                      <div>
                        <span className="font-medium">Specializations:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.farmerProfile.specializations.map((spec, index) => (
                            <Badge key={index} variant="outline">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>All Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {canViewPosts ? (
                <p className="text-muted-foreground">Posts will be displayed here...</p>
              ) : (
                <p className="text-muted-foreground">This user's posts are private.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle>Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Connections list will be displayed here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-medium">Full Name:</span>
                  <p>{fullName}</p>
                </div>
                
                <div>
                  <span className="font-medium">Role:</span>
                  <p className="capitalize">{profile.role}</p>
                </div>
                
                <div>
                  <span className="font-medium">Location:</span>
                  <p>{location || 'Not specified'}</p>
                </div>
                
                <div>
                  <span className="font-medium">Experience Level:</span>
                  <p className="capitalize">{profile.socialProfile?.experienceLevel || 'Beginner'}</p>
                </div>

                {profile.profile.languages && profile.profile.languages.length > 0 && (
                  <div>
                    <span className="font-medium">Languages:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.profile.languages.map((lang, index) => (
                        <Badge key={index} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.role === 'farmer' && profile.farmerProfile ? (
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Farm Name:</span>
                      <p>{profile.farmerProfile.farmName}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Farm Size:</span>
                      <p>{profile.farmerProfile.farmSize} hectares</p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Farming Experience:</span>
                      <p>{profile.farmerProfile.farmingExperience} years</p>
                    </div>

                    {profile.farmerProfile.certifications && profile.farmerProfile.certifications.length > 0 && (
                      <div>
                        <span className="font-medium">Certifications:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.farmerProfile.certifications.map((cert, index) => (
                            <Badge key={index} variant="secondary">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No professional details available.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}