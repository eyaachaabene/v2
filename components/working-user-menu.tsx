"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

export function WorkingUserMenu() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fermer le menu en cliquant à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    setIsOpen(false)
    
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
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
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_profile')
        
        if (logout) {
          logout()
        }
        
        toast.success("Déconnecté avec succès")
        router.push('/login')
      } else {
        throw new Error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_profile')
      if (logout) {
        logout()
      }
      toast.error("Erreur lors de la déconnexion, mais vous avez été déconnecté")
      router.push('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleSettings = () => {
    setIsOpen(false)
    router.push('/settings')
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
    return 'Utilisateur'
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    return name.split(' ').map((word: string) => word.charAt(0)).join('').substring(0, 2).toUpperCase()
  }

  if (!user) {
    return (
      <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-sm">G</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">Invité</span>
          <span className="text-xs text-muted-foreground">Non connecté</span>
        </div>
      </Button>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="ghost" 
        className="flex items-center gap-2 h-auto p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
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
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={handleSettings}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </button>
            
            <hr className="my-1" />
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isLoggingOut ? 'Logout...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}