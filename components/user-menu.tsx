"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

export function UserMenu() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Debug: Log user state
  console.log('UserMenu - user:', user)

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        // Si pas de token, nettoyer le localStorage et rediriger
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_profile')
        router.push('/login')
        return
      }

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Nettoyer le localStorage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_profile')
        
        // Appeler la fonction logout du hook
        if (logout) {
          logout()
        }
        
        toast.success("Disconnected successfully")
        router.push('/login')
      } else {
        throw new Error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // En cas d'erreur, nettoyer quand même le localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_profile')
      if (logout) {
        logout()
      }
      toast.error("Error during logout, but you have been disconnected")
      router.push('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleSettings = () => {
    router.push('/settings')
  }

  const handleProfile = () => {
    if (user?._id) {
      router.push(`/profile/${user._id}`)
    }
  }

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user?.email) {
      const emailPart = user.email.split('@')[0]
      return emailPart
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }
    return 'User'
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    return name.split(' ').map((word: string) => word.charAt(0)).join('').substring(0, 2).toUpperCase()
  }

  if (!user) {
    return (
      <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-sm">U</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">Guest</span>
          <span className="text-xs text-muted-foreground">Not logged in</span>
        </div>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} alt={getUserDisplayName()} />
            <AvatarFallback className="text-sm">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{getUserDisplayName()}</span>
            <span className="text-xs text-muted-foreground capitalize">{user?.role || user?.userType}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 z-50">
        <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout} 
          disabled={isLoggingOut}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}