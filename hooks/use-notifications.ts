"use client"

import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
  marketData?: any
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [priceAlerts, setPriceAlerts] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [priceAlertsCount, setPriceAlertsCount] = useState(0)

  const fetchNotifications = async () => {
    if (!user) return

    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const allNotifications = data.notifications || []
        
        setNotifications(allNotifications)
        
        // Filtrer les alertes de prix
        const priceNotifications = allNotifications.filter((n: Notification) => n.type === 'price_alert')
        setPriceAlerts(priceNotifications)
        
        // Compter les non lues
        const unread = allNotifications.filter((n: Notification) => !n.read).length
        const priceUnread = priceNotifications.filter((n: Notification) => !n.read).length
        
        setUnreadCount(unread)
        setPriceAlertsCount(priceUnread)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Mettre à jour les notifications localement
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
        )
        setPriceAlerts(prev => 
          prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
        )
        
        // Recalculer les compteurs
        setUnreadCount(prev => Math.max(0, prev - 1))
        const wasPrice = priceAlerts.find(n => n._id === notificationId && !n.read)
        if (wasPrice) {
          setPriceAlertsCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [user])

  return {
    notifications,
    priceAlerts,
    loading,
    unreadCount,
    priceAlertsCount,
    fetchNotifications,
    markAsRead
  }
}