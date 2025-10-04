"use client"

import { useState } from "react"
import { Bell, Check, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "@/hooks/use-notifications"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

export function NotificationBell() {
  const router = useRouter()
  const { notifications, unreadCount, loading, isAuthenticated, markAsRead, deleteNotification, refetch } = useNotifications()
  const [open, setOpen] = useState(false)

  // Don't render if user is not authenticated
  if (!isAuthenticated && !loading) {
    return null
  }

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead([notification._id.toString()])
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      setOpen(false)
    }
  }

  const handleMarkAllRead = async () => {
    const unreadIds = notifications
      .filter(n => !n.read)
      .map(n => n._id.toString())
    
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds)
    }
  }

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    await deleteNotification(notificationId)
  }

  const formatTime = (date: Date | string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return "Recently"
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto py-1 px-2 text-xs"
              onClick={handleMarkAllRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <ScrollArea className="max-h-[400px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id.toString()}
                className={`flex flex-col items-start p-3 cursor-pointer ${
                  !notification.read ? "bg-primary/5" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                      <p className="font-medium text-sm truncate">{notification.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {formatTime(notification.createdAt)}
                      </p>
                      <div className="flex items-center gap-1">
                        {notification.actionUrl && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2"
                    onClick={(e) => handleDelete(e, notification._id.toString())}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}

        {!loading && notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center justify-center text-sm text-primary cursor-pointer"
              onClick={() => {
                router.push("/notifications")
                setOpen(false)
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
