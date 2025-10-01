"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { UserPlus, MapPin, Users, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface SuggestedConnection {
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
    skills?: string[]
  }
  socialStats: {
    connectionsCount: number
  }
  role: string
  commonTags?: string[]
  mutualConnections?: number
  connectionReason?: string
}

interface SuggestedConnectionsProps {
  onConnect: (userId: string) => void
  isAuthenticated: boolean
}

export function SuggestedConnections({ onConnect, isAuthenticated }: SuggestedConnectionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestedConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingUsers, setConnectingUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isAuthenticated) {
      fetchSuggestions()
    }
  }, [isAuthenticated])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('/api/users/suggestions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (userId: string) => {
    setConnectingUsers(prev => new Set(prev).add(userId))
    try {
      await onConnect(userId)
      // Remove the user from suggestions after connecting
      setSuggestions(prev => prev.filter(user => user._id !== userId))
    } finally {
      setConnectingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connect with Farmers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Login to discover and connect with fellow farmers in your area.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Suggested Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2 text-sm">Finding connections...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Suggested Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No new suggestions available. Check back later for new farmers to connect with.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Suggested Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.slice(0, 3).map((user) => {
            const fullName = `${user.profile.firstName} ${user.profile.lastName}`
            const location = `${user.profile.location?.city || ''}, ${user.profile.location?.governorate || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Tunisia'
            const isConnecting = connectingUsers.has(user._id)
            
            return (
              <div key={user._id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
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
                      className="font-medium text-sm hover:text-primary transition-colors truncate"
                    >
                      {fullName}
                    </Link>
                    <Badge variant="secondary" className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{location}</span>
                  </div>
                  
                  {user.mutualConnections && user.mutualConnections > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Users className="h-3 w-3" />
                      <span>{user.mutualConnections} mutual connections</span>
                    </div>
                  )}
                  
                  {user.commonTags && user.commonTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {user.commonTags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {user.commonTags.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{user.commonTags.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  {user.socialProfile?.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {user.socialProfile.bio}
                    </p>
                  )}
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleConnect(user._id)}
                  disabled={isConnecting}
                  className="shrink-0"
                >
                  {isConnecting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3 mr-1" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            )
          })}
          
          {suggestions.length > 3 && (
            <div className="text-center pt-2">
              <Link href="/discover">
                <Button variant="outline" size="sm" className="w-full">
                  View All Suggestions ({suggestions.length - 3} more)
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}