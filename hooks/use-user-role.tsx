import { useAuth } from "./use-auth"

export function useUserRole() {
  const { user } = useAuth()
  
  const isSupplier = user?.role === 'supplier'
  const isFarmer = user?.role === 'farmer'
  const isAdmin = user?.role === 'admin'
  
  return {
    user,
    isSupplier,
    isFarmer,
    isAdmin,
    role: user?.role
  }
}