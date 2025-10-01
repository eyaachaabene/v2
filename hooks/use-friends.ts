import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'

interface Friend {
  _id: string
  profile: {
    firstName: string
    lastName: string
    avatar?: string
    location?: {
      governorate?: string
      city?: string
    }
  }
  socialProfile?: {
    bio?: string
  }
  role: string
  addedAt: string
  lastMessageAt?: string
  unreadMessages: number
  lastLogin?: string
  isOnline: boolean
}

interface FriendsData {
  friends: Friend[]
  count: number
}

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchFriends = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem('auth_token')
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch('/api/friends', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch friends')
      }

      setFriends(data.friends || [])
      
    } catch (error) {
      console.error('Error fetching friends:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch friends')
    } finally {
      setIsLoading(false)
    }
  }

  const connectWithUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/users/${userId}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'send' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect with user')
      }

      // Refresh friends list
      await fetchFriends()
      
      return data
    } catch (error) {
      console.error('Error connecting with user:', error)
      throw error
    }
  }

  const disconnectFromUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/users/${userId}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'disconnect' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disconnect from user')
      }

      // Refresh friends list
      await fetchFriends()
      
      return data
    } catch (error) {
      console.error('Error disconnecting from user:', error)
      throw error
    }
  }

  const isFriend = (userId: string): boolean => {
    return friends.some(friend => friend._id === userId)
  }

  const getFriendUnreadCount = (userId: string): number => {
    const friend = friends.find(f => f._id === userId)
    return friend?.unreadMessages || 0
  }

  const getTotalUnreadMessages = (): number => {
    return friends.reduce((total, friend) => total + friend.unreadMessages, 0)
  }

  const getOnlineFriends = (): Friend[] => {
    return friends.filter(friend => friend.isOnline)
  }

  const searchFriends = (query: string): Friend[] => {
    if (!query.trim()) return friends

    const searchTerm = query.toLowerCase()
    return friends.filter(friend => 
      friend.profile.firstName.toLowerCase().includes(searchTerm) ||
      friend.profile.lastName.toLowerCase().includes(searchTerm) ||
      (friend.socialProfile?.bio?.toLowerCase().includes(searchTerm)) ||
      (friend.profile.location?.governorate?.toLowerCase().includes(searchTerm)) ||
      (friend.profile.location?.city?.toLowerCase().includes(searchTerm))
    )
  }

  useEffect(() => {
    if (user) {
      fetchFriends()
    }
  }, [user])

  return {
    friends,
    isLoading,
    error,
    fetchFriends,
    connectWithUser,
    disconnectFromUser,
    isFriend,
    getFriendUnreadCount,
    getTotalUnreadMessages,
    getOnlineFriends,
    searchFriends,
    totalFriends: friends.length,
    onlineFriendsCount: getOnlineFriends().length
  }
}