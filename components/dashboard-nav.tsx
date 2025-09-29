"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sprout,
  Bell,
  Menu,
  Home,
  ShoppingCart,
  Users,
  MessageCircle,
  Briefcase,
  Package,
} from "lucide-react"
import Link from "next/link"
import { WorkingUserMenu } from "@/components/working-user-menu"
import { NativeUserMenu } from "@/components/native-user-menu"
import { CartSheet } from "@/components/cart-sheet"
import { useUserRole } from "@/hooks/use-user-role"

export function DashboardNav() {
  const { isSupplier } = useUserRole()

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Sprout className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">Agri-SHE</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                Marketplace
              </Link>
              <Link
                href="/opportunities"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Briefcase className="h-4 w-4" />
                Opportunities
              </Link>
              <Link
                href="/community"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Users className="h-4 w-4" />
                Community
              </Link>
              <Link
                href="/messages"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Messages
              </Link>
              <Link
                href="/orders"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Package className="h-4 w-4" />
                Orders
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <CartSheet />
            
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
            </Button>

                        <WorkingUserMenu />

            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
