"use client"

import { useAuth } from "./use-auth"

export const useUserRole = () => {
  const { user } = useAuth()
  
  const isSupplier = user?.role === "supplier"
  const isFarmer = user?.role === "farmer"
  const isBuyer = user?.role === "buyer"
  const isPartner = user?.role === "partner" || user?.role === "ngo"
  const isAdmin = user?.role === "admin"
  
  return {
    user,
    isSupplier,
    isFarmer,
    isBuyer,
    isPartner,
    isAdmin,
    role: user?.role
  }
}