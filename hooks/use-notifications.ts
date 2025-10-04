"use client"

import { useState, useEffect } from "react"
import { useAuth } from './use-auth'

export interface Notification {
  _id: string
  type: "new_application" | "application_status_update" | "opportunity_update" | "price_alert"
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
  marketData?: any
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [priceAlerts, setPriceAlerts] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [priceAlertsCount, setPriceAlertsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const fetchNotifications = async (unreadOnly = false) => {
    if (!user) {
      setNotifications([])
      setPriceAlerts([])
      setUnreadCount(0)
      setPriceAlertsCount(0)
      setLoading(false)
      setIsAuthenticated(false)
      return
    }

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
        setPriceAlerts([])
        setUnreadCount(0)
        setPriceAlertsCount(0)
        setError(null)
        setLoading(false)
        setIsAuthenticated(false)
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch notifications")
      }

      const allNotifications = data.notifications || []
      setNotifications(allNotifications)
      
      // Filter price alerts
      const priceNotifications = allNotifications.filter((n: Notification) => n.type === 'price_alert')
      setPriceAlerts(priceNotifications)
      
      // Count unread notifications
      const unread = allNotifications.filter((n: Notification) => !n.read).length
      const priceUnread = priceNotifications.filter((n: Notification) => !n.read).length
      
      setUnreadCount(data.unreadCount !== undefined ? data.unreadCount : unread)
      setPriceAlertsCount(priceUnread)
      setError(null)
      setIsAuthenticated(true)
    } catch (err) {
      // Only log errors that aren't auth-related
      setError(null) // Don't show errors to user for notifications
      setNotifications([])
      setPriceAlerts([])
      setUnreadCount(0)
      setPriceAlertsCount(0)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string[] | string) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds]
      
      // For single notification, use PATCH endpoint
      if (ids.length === 1) {
        const response = await fetch(`/api/notifications/${ids[0]}/read`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          // Update notifications locally
          setNotifications(prev => 
            prev.map(n => n._id === ids[0] ? { ...n, read: true } : n)
          )
          setPriceAlerts(prev => 
            prev.map(n => n._id === ids[0] ? { ...n, read: true } : n)
          )
          
          // Recalculate counters
          setUnreadCount(prev => Math.max(0, prev - 1))
          const wasPrice = priceAlerts.find(n => n._id === ids[0] && !n.read)
          if (wasPrice) {
            setPriceAlertsCount(prev => Math.max(0, prev - 1))
          }
        }
      } else {
        // For multiple notifications, use PATCH with body
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ notificationIds: ids, markAsRead: true }),
        })

        if (response.ok) {
          // Update local state
          setNotifications(prev =>
            prev.map(notif =>
              ids.includes(notif._id.toString())
                ? { ...notif, read: true, readAt: new Date() }
                : notif
            )
          )
          setPriceAlerts(prev =>
            prev.map(notif =>
              ids.includes(notif._id.toString())
                ? { ...notif, read: true, readAt: new Date() }
                : notif
            )
          )
          setUnreadCount(prev => Math.max(0, prev - ids.length))
          
          const priceAlertsToUpdate = priceAlerts.filter(n => ids.includes(n._id) && !n.read)
          setPriceAlertsCount(prev => Math.max(0, prev - priceAlertsToUpdate.length))
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to delete notification")
      }

      // Update local state
      const deletedNotification = notifications.find(n => n._id.toString() === notificationId)
      setNotifications(prev => prev.filter(n => n._id.toString() !== notificationId))
      setPriceAlerts(prev => prev.filter(n => n._id.toString() !== notificationId))
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
        if (deletedNotification.type === 'price_alert') {
          setPriceAlertsCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (err) {
      console.error("Error deleting notification:", err)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchNotifications()
  }, [user])

  useEffect(() => {
    // Only set up polling interval if user is authenticated
    if (!isAuthenticated || !user) {
      return
    }

    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated, user])

  return {
    notifications,
    priceAlerts,
    unreadCount,
    priceAlertsCount,
    loading,
    error,
    isAuthenticated,
    refetch: fetchNotifications,
    markAsRead,
    deleteNotification,
    fetchNotifications,
  }
}