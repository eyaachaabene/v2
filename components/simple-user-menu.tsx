"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"

export function SimpleUserMenu() {
  const handleSettings = () => {
    console.log("Settings clicked")
    alert("Settings clicked!")
  }

  const handleLogout = () => {
    console.log("Logout clicked")
    alert("Logout clicked!")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="h-4 w-4 mr-2" />
          Menu Test
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white border border-gray-200 shadow-lg rounded-md p-1 z-[9999]"
        style={{ zIndex: 9999 }}
      >
        <DropdownMenuItem 
          onClick={handleSettings} 
          className="cursor-pointer hover:bg-gray-100 p-2 rounded flex items-center"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1 border-t border-gray-200" />
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer hover:bg-gray-100 p-2 rounded flex items-center text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}