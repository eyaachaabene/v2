"use client"

import { useState, useEffect, useCallback } from 'react'
import type { UserProfile, User } from '@/lib/models/User'

export interface UseUserProfileReturn {
  // Profile data
  profile: UserProfile | null
  loading: boolean
  error: string | null
  
  // Connection management
  connectionStatus: 'none' | 'pending' | 'accepted' | 'blocked'
  isFollowing: boolean
  isFollowed: boolean
  mutualConnections: number
  
  // Connection actions
  sendConnectionRequest: (message?: string) => Promise<boolean>
  acceptConnectionRequest: () => Promise<boolean>
  declineConnectionRequest: () => Promise<boolean>
  removeConnection: () => Promise<boolean>
  blockUser: () => Promise<boolean>
  unblockUser: () => Promise<boolean>
  
  // Follow actions
  followUser: () => Promise<boolean>
  unfollowUser: () => Promise<boolean>
  
  // Profile updates (for own profile)
  updateProfile: (updates: Partial<User>) => Promise<boolean>
  
  // Connections/followers/following
  connections: UserProfile[]
  followers: UserProfile[]
  following: UserProfile[]
  loadConnections: (type: 'connections' | 'followers' | 'following', page?: number) => Promise<void>
  
  // Utility functions
  refreshProfile: () => Promise<void>
  canViewProfile: boolean
  canViewPosts: boolean
  canViewContactInfo: boolean
}

export function useUserProfile(userId: string): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Connection data
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'accepted' | 'blocked'>('none')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowed, setIsFollowed] = useState(false)
  const [mutualConnections, setMutualConnections] = useState(0)
  
  // Connections lists
  const [connections, setConnections] = useState<UserProfile[]>([])
  const [followers, setFollowers] = useState<UserProfile[]>([])
  const [following, setFollowing] = useState<UserProfile[]>([])

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('auth_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/users/${userId}`, {
        headers
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile')
      }

      setProfile(data.profile)
      setConnectionStatus(data.profile.connectionStatus || 'none')
      setIsFollowing(data.profile.isFollowing || false)
      setIsFollowed(data.profile.isFollowed || false)
      setMutualConnections(data.profile.mutualConnections || 0)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Connection management functions
  const sendConnectionRequest = async (message?: string): Promise<boolean> => {
    try {
      setError(null)
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Please login to send connection requests')
      }

      const response = await fetch(`/api/users/${userId}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'send', message })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send connection request')
      }

      setConnectionStatus('pending')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send connection request'
      setError(errorMessage)
      return false
    }
  }

  const acceptConnectionRequest = async (): Promise<boolean> => {
    try {
      setError(null)
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Please login to accept connection requests')
      }

      const response = await fetch(`/api/users/${userId}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'accept' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept connection request')
      }

      setConnectionStatus('accepted')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept connection request'
      setError(errorMessage)
      return false
    }
  }

  const declineConnectionRequest = async (): Promise<boolean> => {
    try {
      setError(null)
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Please login to decline connection requests')
      }

      const response = await fetch(`/api/users/${userId}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'decline' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to decline connection request')
      }

      setConnectionStatus('none')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to decline connection request'
      setError(errorMessage)
      return false
    }
  }

  const removeConnection = async (): Promise<boolean> => {
    try {
      setError(null)
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Please login to remove connections')
      }

      const response = await fetch(`/api/users/${userId}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'remove' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove connection')
      }

      setConnectionStatus('none')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove connection'
      setError(errorMessage)
      return false
    }
  }

  const blockUser = async (): Promise<boolean> => {
    try {
      setError(null)
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Please login to block users')
      }

      const response = await fetch(`/api/users/${userId}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'block' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to block user')
      }

      setConnectionStatus('blocked')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to block user'
      setError(errorMessage)
      return false
    }
  }

  const unblockUser = async (): Promise<boolean> => {
    try {
      setError(null)
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Please login to unblock users')
      }

      const response = await fetch(`/api/users/${userId}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'unblock' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unblock user')
      }

      setConnectionStatus('none')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unblock user'
      setError(errorMessage)
      return false
    }
  }

  // Follow management functions
  const followUser = async (): Promise<boolean> => {
    try {
      setError(null)
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Please login to follow users')
      }

      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'follow' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to follow user')
      }

      setIsFollowing(true)
      // Update follower count in profile
      if (profile) {
        setProfile({
          ...profile,
          socialStats: {
            ...profile.socialStats,
            followersCount: profile.socialStats.followersCount + 1
          }
        })
      }
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to follow user'
      setError(errorMessage)
      return false
    }
  }

  const unfollowUser = async (): Promise<boolean> => {
    try {
      setError(null)
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Please login to unfollow users')
      }

      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'unfollow' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unfollow user')
      }

      setIsFollowing(false)
      // Update follower count in profile
      if (profile) {
        setProfile({
          ...profile,
          socialStats: {
            ...profile.socialStats,
            followersCount: Math.max(0, profile.socialStats.followersCount - 1)
          }
        })
      }
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unfollow user'
      setError(errorMessage)
      return false
    }
  }

  // Profile update function (for own profile)
  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      setError(null)
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Please login to update profile')
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      // Refresh the profile after update
      await fetchProfile()
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      return false
    }
  }

  // Load connections, followers, or following
  const loadConnections = async (type: 'connections' | 'followers' | 'following', page: number = 1) => {
    try {
      const token = localStorage.getItem('auth_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/users/${userId}/connections?type=${type}&page=${page}&limit=20`, {
        headers
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to load ${type}`)
      }

      switch (type) {
        case 'connections':
          setConnections(page === 1 ? data.connections : [...connections, ...data.connections])
          break
        case 'followers':
          setFollowers(page === 1 ? data.followers : [...followers, ...data.followers])
          break
        case 'following':
          setFollowing(page === 1 ? data.following : [...following, ...data.following])
          break
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to load ${type}`
      setError(errorMessage)
    }
  }

  // Refresh profile
  const refreshProfile = async () => {
    await fetchProfile()
  }

  // Load profile on component mount or userId change
  useEffect(() => {
    if (userId) {
      fetchProfile()
    }
  }, [userId, fetchProfile])

  return {
    // Profile data
    profile,
    loading,
    error,
    
    // Connection status
    connectionStatus,
    isFollowing,
    isFollowed,
    mutualConnections,
    
    // Connection actions
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    removeConnection,
    blockUser,
    unblockUser,
    
    // Follow actions
    followUser,
    unfollowUser,
    
    // Profile updates
    updateProfile,
    
    // Connections data
    connections,
    followers,
    following,
    loadConnections,
    
    // Utility functions
    refreshProfile,
    canViewProfile: profile?.canViewProfile || false,
    canViewPosts: profile?.canViewPosts || false,
    canViewContactInfo: profile?.canViewContactInfo || false
  }
}