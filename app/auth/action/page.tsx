"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sprout, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function AuthActionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const mode = searchParams.get("mode")
  const oobCode = searchParams.get("oobCode")

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (!mode || !oobCode) {
      setError("Invalid action link")
      setLoading(false)
      return
    }

    handleAuthAction()
  }, [mode, oobCode])

  const handleAuthAction = async () => {
    try {
      switch (mode) {
        case "verifyEmail":
          await applyActionCode(auth, oobCode!)
          setSuccess(true)
          toast({
            title: "Success",
            description: "Email verified successfully!",
          })
          break

        case "resetPassword":
          await verifyPasswordResetCode(auth, oobCode!)
          // Don't set success yet, wait for password reset
          break

        default:
          setError("Unknown action mode")
      }
    } catch (error: any) {
      setError(error.message || "Failed to process action")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await confirmPasswordReset(auth, oobCode!, newPassword)
      setSuccess(true)
      toast({
        title: "Success",
        description: "Password reset successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Processing your request...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">AgriConnect</span>
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            {success ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-500" />
                Success
              </>
            ) : error ? (
              <>
                <XCircle className="h-6 w-6 text-red-500" />
                Error
              </>
            ) : (
              "Reset Password"
            )}
          </CardTitle>
          <CardDescription>
            {success && mode === "verifyEmail" && "Your email has been verified successfully!"}
            {success && mode === "resetPassword" && "Your password has been reset successfully!"}
            {error && error}
            {!success && !error && mode === "resetPassword" && "Enter your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <Button asChild className="w-full" size="lg">
              <Link href="/login">Continue to Login</Link>
            </Button>
          ) : error ? (
            <Button asChild className="w-full" size="lg">
              <Link href="/login">Back to Login</Link>
            </Button>
          ) : mode === "resetPassword" ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button className="w-full" size="lg" type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
