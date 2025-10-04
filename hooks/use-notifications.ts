"use client"

import { useState, useEffect } from "react"

export interface Notification {
  _id: string
  type: "new_application" | "application_status_update" | "opportunity_update"
  recipientId: string
  senderId?: string
  opportunityId?: string
  applicationId?: string
  title: string
  message: string
  actionUrl?: string
  read: boolean
  createdAt: Date
  readAt?: Date
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const fetchNotifications = async (unreadOnly = false) => {
    try {
      setLoading(true)
      const url = unreadOnly 
        ? "/api/notifications?unreadOnly=true&limit=10"
        : "/api/notifications?limit=20"
      
      // Get token from localStorage
      const token = localStorage.getItem('auth_token')
      
      const headers: Record<string, string> = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        headers,
        credentials: "include", // Include cookies in request
      })
      
      // If unauthorized (401), user is not logged in - silently fail
      if (response.status === 401) {
        setNotifications([])
        setUnreadCount(0)
        setError(null)
        setLoading(false)
        setIsAuthenticated(false)
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch notifications")
      }

      setNotifications(data.notifications || [])
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount)
      }
      setError(null)
      setIsAuthenticated(true)
    } catch (err) {
      // Only log errors that aren't auth-related
      setError(null) // Don't show errors to user for notifications
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds, markAsRead: true }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark as read")
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notificationIds.includes(notif._id.toString())
            ? { ...notif, read: true, readAt: new Date() }
            : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
    } catch (err) {
      console.error("Error marking notifications as read:", err)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete notification")
      }

      // Update local state
      setNotifications(prev => prev.filter(n => n._id.toString() !== notificationId))
      const wasUnread = notifications.find(n => n._id.toString() === notificationId && !n.read)
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error("Error deleting notification:", err)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchNotifications()
  }, [])

  useEffect(() => {
    // Only set up polling interval if user is authenticated
    if (!isAuthenticated) {
      return
    }

    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    isAuthenticated,
    refetch: fetchNotifications,
    markAsRead,
    deleteNotification,
  }
}
