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
  userLiked?: boolean
  postComments?: Comment[]
}

export interface Comment {
  id: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  content: string
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
  addComment: (postId: string, content: string) => Promise<boolean>
  fetchComments: (postId: string) => Promise<boolean>
  sharePost: (postId: string, platform?: string) => Promise<void>
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
            ? { ...post, likes: data.likeCount, userLiked: data.userLiked }
            : post
        )
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to like post'
      setError(errorMessage)
      console.error('Error liking post:', err)
    }
  }

  const addComment = async (postId: string, content: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Please login to comment on posts')
      }

      const response = await fetch(`/api/community/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add comment')
      }

      // Update the post in the local state
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                comments: data.commentCount,
                postComments: [...(post.postComments || []), {
                  id: data.comment.id,
                  user: data.comment.user,
                  content: data.comment.content,
                  createdAt: data.comment.createdAt
                }]
              }
            : post
        )
      )
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment'
      setError(errorMessage)
      console.error('Error adding comment:', err)
      return false
    }
  }

  const fetchComments = async (postId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/community/${postId}/comments`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch comments')
      }

      // Update the post with all comments
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                postComments: data.comments,
                comments: data.commentCount
              }
            : post
        )
      )
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comments'
      setError(errorMessage)
      console.error('Error fetching comments:', err)
      return false
    }
  }

  const sharePost = async (postId: string, platform?: string) => {
    try {
      const post = posts.find(p => p.id === postId)
      if (!post) return

      const shareUrl = `${window.location.origin}/community/post/${postId}`
      const shareText = `Check out this post: ${post.content.substring(0, 100)}...`

      if (platform === 'copy') {
        await navigator.clipboard.writeText(shareUrl)
        // You might want to show a toast notification here
        console.log('Link copied to clipboard!')
      } else if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        window.open(twitterUrl, '_blank')
      } else if (platform === 'facebook') {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        window.open(facebookUrl, '_blank')
      } else {
        // Web Share API for native sharing
        if (navigator.share) {
          await navigator.share({
            title: 'Community Post',
            text: shareText,
            url: shareUrl
          })
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(shareUrl)
          console.log('Link copied to clipboard!')
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share post'
      setError(errorMessage)
      console.error('Error sharing post:', err)
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
    addComment,
    fetchComments,
    sharePost,
    refreshPosts,
    hasMore,
    loadMore
  }
}