"use client"

import { useEffect, useState } from "react"
import { type UserProfile } from "@/lib/auth"

interface AuthState {
  user: any
  profile: UserProfile | null
  loading: boolean
  token: string | null
}

interface AuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuth = (): AuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    token: null
  })

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const storedProfile = localStorage.getItem('user_profile')

    if (token && storedProfile) {
      try {
        const profile = JSON.parse(storedProfile)
        setAuthState({
          user: profile,
          profile,
          loading: false,
          token
        })
      } catch (error) {
        console.error("[v0] Failed to parse stored profile:", error)
        setAuthState({ user: null, profile: null, loading: false, token: null })
      }
    } else {
      setAuthState({ user: null, profile: null, loading: false, token: null })
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user_profile', JSON.stringify(data.user))

      setAuthState({
        user: data.user,
        profile: data.user,
        loading: false,
        token: data.token
      })

      return data
    } catch (error) {
      console.error("[v0] Login error:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_profile')
    setAuthState({ user: null, profile: null, loading: false, token: null })
  }

  return { 
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    token: authState.token,
    login,
    logout
  }
}
