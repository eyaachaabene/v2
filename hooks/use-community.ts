"use client"

import { useState, useEffect } from 'react'

export interface CommunityPost {
  id: string
  author: string
  location: string
  avatar?: string
  time: string
  content: string
  tags: string[]
  likes: number
  comments: number
  images?: string[]
  category: string
  createdAt: string
}

export interface CreatePostData {
  content: string
  tags: string[]
  category?: string
  images?: string[]
  visibility?: 'public' | 'followers' | 'private'
}

interface UseCommunityReturn {
  posts: CommunityPost[]
  loading: boolean
  error: string | null
  createPost: (postData: CreatePostData) => Promise<boolean>
  likePost: (postId: string) => Promise<void>
  refreshPosts: () => Promise<void>
  hasMore: boolean
  loadMore: () => Promise<void>
}

export function useCommunity(): UseCommunityReturn {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/community?page=${pageNum}&limit=10`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts')
      }

      if (reset) {
        setPosts(data.posts)
      } else {
        setPosts(prev => [...prev, ...data.posts])
      }
      
      setHasMore(data.pagination.hasNext)
      setPage(pageNum)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (postData: CreatePostData): Promise<boolean> => {
    try {
      setError(null)
      
      // Get auth token from localStorage (matching the existing auth system)
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Please login to share a post')
      }

      const response = await fetch('/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create post')
      }

      // Add the new post to the beginning of the posts list
      setPosts(prev => [data.post, ...prev])
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post'
      setError(errorMessage)
      console.error('Error creating post:', err)
      return false
    }
  }

  const likePost = async (postId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Please login to like posts')
      }

      const response = await fetch(`/api/community/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to like post')
      }

      // Update the post in the local state
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, likes: data.likeCount }
            : post
        )
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to like post'
      setError(errorMessage)
      console.error('Error liking post:', err)
    }
  }

  const refreshPosts = async () => {
    await fetchPosts(1, true)
  }

  const loadMore = async () => {
    if (!loading && hasMore) {
      await fetchPosts(page + 1, false)
    }
  }

  useEffect(() => {
    fetchPosts(1, true)
  }, [])

  return {
    posts,
    loading,
    error,
    createPost,
    likePost,
    refreshPosts,
    hasMore,
    loadMore
  }
}