"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { User, Settings, LogOut } from "lucide-react"

export function NativeUserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSettings = () => {
    console.log("Settings clicked")
    alert("Settings clicked!")
    setIsOpen(false)
  }

  const handleLogout = () => {
    console.log("Logout clicked")
    alert("Logout clicked!")
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <User className="h-4 w-4 mr-2" />
        Native Menu
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md p-1 z-[9999]">
          <div 
            onClick={handleSettings}
            className="cursor-pointer hover:bg-gray-100 p-2 rounded flex items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </div>
          <div className="my-1 border-t border-gray-200" />
          <div 
            onClick={handleLogout}
            className="cursor-pointer hover:bg-gray-100 p-2 rounded flex items-center text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </div>
        </div>
      )}
    </div>
  )
}