"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sprout, ShoppingCart, Heart, X } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

const userRoles = [
  { value: "farmer", label: "Farmer", icon: Sprout, description: "Grow and sell crops" },
  { value: "buyer", label: "Buyer", icon: ShoppingCart, description: "Purchase agricultural products" },
  { value: "expert", label: "Partner/NGO", icon: Heart, description: "Support and collaborate" },
]

const cropTags = ["Olives", "Tomatoes", "Wheat", "Citrus", "Dates", "Peppers", "Herbs", "Grapes"]
const resourceTags = ["Fertilizer", "Irrigation", "Training", "Equipment", "Seeds", "Pesticides"]
const regions = ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès", "Ariana", "Gafsa"]

export default function SignupPage() {
  const searchParams = useSearchParams()
  const initialRole = searchParams.get("role") as "farmer" | "buyer" | "expert" | null

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    location: "",
  })
  const [selectedRole, setSelectedRole] = useState<"farmer" | "buyer" | "expert" | "">(initialRole || "")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select your role",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: selectedRole,
        location: formData.location,
        phone: formData.phone,
      })

      toast({
        title: "Success",
        description: "Account created successfully! Please check your email to verify your account.",
      })

      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sprout className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">Agri-SHE</span>
            </div>
            <CardTitle className="text-2xl">Join Our Community</CardTitle>
            <CardDescription>
              Create your account and start your journey with Agri-SHE - empowering women farmers from soil to market
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Choose Your Role</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userRoles.map((role) => {
                    const Icon = role.icon
                    return (
                      <Card
                        key={role.value}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedRole === role.value ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedRole(role.value as "farmer" | "buyer" | "expert")}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <h4 className="font-semibold">{role.label}</h4>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Tags Selection */}
              {selectedRole === "farmer" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">What do you grow?</h3>
                  <div className="flex flex-wrap gap-2">
                    {cropTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                        {selectedTags.includes(tag) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(selectedRole === "buyer" || selectedRole === "expert") && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {selectedRole === "buyer" ? "What are you interested in?" : "What resources do you provide?"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedRole === "buyer" ? cropTags : resourceTags).map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                        {selectedTags.includes(tag) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full" size="lg" type="submit" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
