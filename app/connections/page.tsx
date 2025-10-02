"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Heart,
  Search,
  Filter,
  Check,
  X,
  MoreHorizontal,
  MapPin,
  Loader2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

interface ConnectionUser {
  _id: string
  profile: {
    firstName: string
    lastName: string
    avatar?: string
    location: {
      governorate?: string
      city?: string
    }
  }
  socialProfile?: {
    bio?: string
  }
  socialStats: {
    connectionsCount: number
    followersCount: number
  }
  role: string
  connectedAt?: Date
  followedAt?: Date
  status?: 'pending' | 'accepted'
  requestedBy?: string
  mutualConnections?: number
}

interface ConnectionRequest extends ConnectionUser {
  requestedBy: string
  message?: string
}

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState('connections')
  const [connections, setConnections] = useState<ConnectionUser[]>([])
  const [followers, setFollowers] = useState<ConnectionUser[]>([])
  const [following, setFollowing] = useState<ConnectionUser[]>([])
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([])
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([])
  
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchConnectionsData()
  }, [])

  const fetchConnectionsData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      if (!token) return

      // Fetch all connections data in parallel
      const [connectionsRes, followersRes, followingRes, requestsRes] = await Promise.all([
        fetch('/api/connections/list?type=connections', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/connections/list?type=followers', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/connections/list?type=following', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/connections/requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const [connectionsData, followersData, followingData, requestsData] = await Promise.all([
        connectionsRes.json(),
        followersRes.json(),
        followingRes.json(),
        requestsRes.json()
      ])

      if (connectionsData.success) setConnections(connectionsData.connections || [])
      if (followersData.success) setFollowers(followersData.followers || [])
      if (followingData.success) setFollowing(followingData.following || [])
      if (requestsData.success) {
        setPendingRequests(requestsData.received || [])
        setSentRequests(requestsData.sent || [])
      }

    } catch (error) {
      console.error('Error fetching connections data:', error)
      toast({
        title: "Error",
        description: "Failed to load connections data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConnectionAction = async (userId: string, action: 'accept' | 'decline' | 'remove' | 'cancel') => {
    setActionLoading(`${action}-${userId}`)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`/api/users/${userId}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} connection`)
      }

      // Update local state based on action
      switch (action) {
        case 'accept':
          setPendingRequests(prev => prev.filter(req => req._id !== userId))
          setConnections(prev => [...prev, pendingRequests.find(req => req._id === userId)!])
          break
        case 'decline':
        case 'cancel':
          setPendingRequests(prev => prev.filter(req => req._id !== userId))
          setSentRequests(prev => prev.filter(req => req._id !== userId))
          break
        case 'remove':
          setConnections(prev => prev.filter(conn => conn._id !== userId))
          break
      }

      toast({
        title: "Success",
        description: data.message || `Connection ${action}ed successfully`
      })

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} connection`,
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleFollowAction = async (userId: string, action: 'follow' | 'unfollow') => {
    setActionLoading(`${action}-${userId}`)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} user`)
      }

      if (action === 'unfollow') {
        setFollowing(prev => prev.filter(user => user._id !== userId))
      }

      toast({
        title: "Success",
        description: data.message || `${action === 'follow' ? 'Followed' : 'Unfollowed'} successfully`
      })

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} user`,
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const filterUsers = (users: ConnectionUser[], searchTerm: string) => {
    if (!searchTerm) return users
    const term = searchTerm.toLowerCase()
    return users.filter(user => 
      `${user.profile.firstName} ${user.profile.lastName}`.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term) ||
      user.profile.location?.city?.toLowerCase().includes(term) ||
      user.profile.location?.governorate?.toLowerCase().includes(term)
    )
  }

  const UserCard = ({ user, type }: { user: ConnectionUser | ConnectionRequest, type: 'connection' | 'follower' | 'following' | 'pending' | 'sent' }) => {
    const fullName = `${user.profile.firstName} ${user.profile.lastName}`
    const location = `${user.profile.location?.city || ''}, ${user.profile.location?.governorate || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Tunisia'
    
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Link href={`/profile/${user._id}`}>
              <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-1 transition-all">
                <AvatarImage src={user.profile.avatar} alt={fullName} />
                <AvatarFallback>
                  {user.profile.firstName[0]}{user.profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link 
                  href={`/profile/${user._id}`}
                  className="font-medium hover:text-primary transition-colors truncate"
                >
                  {fullName}
                </Link>
                <Badge variant="secondary" className="text-xs">
                  {user.role}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{location}</span>
              </div>
              
              {user.mutualConnections && user.mutualConnections > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <Users className="h-3 w-3" />
                  <span>{user.mutualConnections} mutual connections</span>
                </div>
              )}
              
              {user.socialProfile?.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {user.socialProfile.bio}
                </p>
              )}

              {type === 'pending' && 'message' in user && user.message && (
                <p className="text-sm bg-muted p-2 rounded mb-2">
                  "{user.message}"
                </p>
              )}
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{user.socialStats.connectionsCount} connections</span>
                <span>•</span>
                <span>{user.socialStats.followersCount} followers</span>
                {type === 'connection' && user.connectedAt && (
                  <>
                    <span>•</span>
                    <span>Connected {new Date(user.connectedAt).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              {type === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleConnectionAction(user._id, 'accept')}
                    disabled={actionLoading === `accept-${user._id}`}
                    className="w-20"
                  >
                    {actionLoading === `accept-${user._id}` ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleConnectionAction(user._id, 'decline')}
                    disabled={actionLoading === `decline-${user._id}`}
                    className="w-20"
                  >
                    {actionLoading === `decline-${user._id}` ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </Button>
                </>
              )}
              
              {type === 'sent' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConnectionAction(user._id, 'cancel')}
                  disabled={actionLoading === `cancel-${user._id}`}
                >
                  {actionLoading === `cancel-${user._id}` ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Cancel'
                  )}
                </Button>
              )}
              
              {type === 'connection' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleConnectionAction(user._id, 'remove')}
                      className="text-destructive"
                    >
                      Remove Connection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {type === 'following' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFollowAction(user._id, 'unfollow')}
                  disabled={actionLoading === `unfollow-${user._id}`}
                >
                  {actionLoading === `unfollow-${user._id}` ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Unfollow'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading connections...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Connections</h1>
        <p className="text-muted-foreground">Manage your connections, followers, and connection requests</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{connections.length}</div>
            <div className="text-sm text-muted-foreground">Connections</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{followers.length}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{following.length}</div>
            <div className="text-sm text-muted-foreground">Following</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">{pendingRequests.length}</div>
            <div className="text-sm text-muted-foreground">Pending Requests</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Connections ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="followers" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Followers ({followers.length})
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Following ({following.length})
          </TabsTrigger>
        </TabsList>

        {/* Connections Tab */}
        <TabsContent value="connections">
          <div className="grid gap-4">
            {filterUsers(connections, searchTerm).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No connections yet</h3>
                  <p className="text-muted-foreground">Start connecting with fellow farmers to grow your network!</p>
                </CardContent>
              </Card>
            ) : (
              filterUsers(connections, searchTerm).map((user) => (
                <UserCard key={user._id} user={user} type="connection" />
              ))
            )}
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests">
          <div className="space-y-6">
            {pendingRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Pending Requests ({pendingRequests.length})</h3>
                <div className="grid gap-4">
                  {filterUsers(pendingRequests, searchTerm).map((user) => (
                    <UserCard key={user._id} user={user} type="pending" />
                  ))}
                </div>
              </div>
            )}
            
            {sentRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Sent Requests ({sentRequests.length})</h3>
                <div className="grid gap-4">
                  {filterUsers(sentRequests, searchTerm).map((user) => (
                    <UserCard key={user._id} user={user} type="sent" />
                  ))}
                </div>
              </div>
            )}
            
            {pendingRequests.length === 0 && sentRequests.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No pending requests</h3>
                  <p className="text-muted-foreground">All caught up! No pending connection requests at the moment.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Followers Tab */}
        <TabsContent value="followers">
          <div className="grid gap-4">
            {filterUsers(followers, searchTerm).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No followers yet</h3>
                  <p className="text-muted-foreground">Share valuable content to attract followers to your profile!</p>
                </CardContent>
              </Card>
            ) : (
              filterUsers(followers, searchTerm).map((user) => (
                <UserCard key={user._id} user={user} type="follower" />
              ))
            )}
          </div>
        </TabsContent>

        {/* Following Tab */}
        <TabsContent value="following">
          <div className="grid gap-4">
            {filterUsers(following, searchTerm).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Not following anyone yet</h3>
                  <p className="text-muted-foreground">Discover and follow other farmers to see their updates!</p>
                </CardContent>
              </Card>
            ) : (
              filterUsers(following, searchTerm).map((user) => (
                <UserCard key={user._id} user={user} type="following" />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}