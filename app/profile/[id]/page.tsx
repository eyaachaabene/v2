"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Phone, MapPin, Star, Calendar, Package, Sprout, Users, Heart, Share2 } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import { UserItemsGrid } from "@/components/user-items-grid"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

interface UserProfile {
  _id: string
  email: string
  role: 'farmer' | 'supplier'
  profile: {
    firstName?: string
    lastName?: string
    phone?: string
    address?: string
    bio?: string
    avatar?: string
  }
  location?: {
    governorate: string
    city: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  stats: {
    totalProducts?: number
    totalResources?: number
    totalSales?: number
    rating?: number
    reviewCount?: number
    yearsExperience?: number
    joinedDate: string
  }
}

interface Product {
  _id: string
  name: string
  description: string
  category: string
  images: string[]
  pricing: {
    price: number
    currency: string
    unit: string
  }
  availability: {
    status: string
    quantity: number
  }
  tags: string[]
  createdAt: string
}

interface Resource {
  _id: string
  name: string
  description: string
  category: string
  type: string
  images: string[]
  pricing: {
    price: number
    currency: string
    unit: string
    minimumOrder: number
  }
  availability: {
    status: string
    quantity: number
  }
  tags: string[]
  createdAt: string
}

export default function ProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const { user: currentUser, profile: currentUserProfile } = useAuth()
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Check if the current user is viewing their own profile
  const isCurrentUser = currentUserProfile?.uid === userId || currentUser?._id === userId || currentUser?.uid === userId

  useEffect(() => {
    if (userId) {
      fetchUserProfile()
      fetchUserProducts()
      fetchUserResources()
    }
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }
      const data = await response.json()
      setUserProfile(data.user)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setError('Failed to load user profile')
    }
  }

  const fetchUserProducts = async () => {
    try {
      const response = await fetch(`/api/products?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching user products:', error)
    }
  }

  const fetchUserResources = async () => {
    try {
      const response = await fetch(`/api/resources?supplierId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setResources(data.resources || [])
      }
    } catch (error) {
      console.error('Error fetching user resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = (profile: UserProfile) => {
    if (profile.profile?.firstName && profile.profile?.lastName) {
      return `${profile.profile.firstName} ${profile.profile.lastName}`
    }
    if (profile.email) {
      const emailPart = profile.email.split('@')[0]
      return emailPart
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }
    return 'User'
  }

  const getInitials = (profile: UserProfile) => {
    const name = getDisplayName(profile)
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleContact = () => {
    if (userProfile?.profile?.phone) {
      window.open(`tel:${userProfile.profile.phone}`)
    } else {
      toast.info("Contact information not available")
    }
  }

  const handleMessage = () => {
    toast.info("Messaging feature coming soon")
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${getDisplayName(userProfile!)} - Profile`,
        text: `Check out ${getDisplayName(userProfile!)}'s profile`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Profile link copied to clipboard")
    }
  }

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile)
  }

  const handleItemDelete = (itemId: string, itemType: 'products' | 'resources') => {
    if (itemType === 'products') {
      setProducts(prev => prev.filter(item => item._id !== itemId))
    } else {
      setResources(prev => prev.filter(item => item._id !== itemId))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading profile...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Profile Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The user profile you're looking for doesn't exist or couldn't be loaded.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={userProfile.profile?.avatar} alt={getDisplayName(userProfile)} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(userProfile)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex gap-2">
                  {isCurrentUser ? (
                    <EditProfileDialog 
                      userProfile={userProfile} 
                      isCurrentUser={isCurrentUser}
                      onProfileUpdate={handleProfileUpdate}
                    />
                  ) : (
                    <>
                      <Button onClick={handleMessage} className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </Button>
                      <Button variant="outline" onClick={handleContact} className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold">{getDisplayName(userProfile)}</h1>
                  <Badge variant={userProfile.role === 'farmer' ? 'default' : 'secondary'}>
                    {userProfile.role === 'farmer' ? 'Farmer' : 'Supplier'}
                  </Badge>
                </div>

                {userProfile.profile?.bio && (
                  <p className="text-gray-600 mb-4 max-w-2xl">
                    {userProfile.profile.bio}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {userProfile.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{userProfile.location.city}, {userProfile.location.governorate}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(userProfile.stats.joinedDate).toLocaleDateString()}</span>
                  </div>

                  {userProfile.stats.rating && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{userProfile.stats.rating.toFixed(1)} ({userProfile.stats.reviewCount} reviews)</span>
                    </div>
                  )}

                  {userProfile.stats.yearsExperience && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{userProfile.stats.yearsExperience} years experience</span>
                    </div>
                  )}
                </div>

                {/* Stats Row */}
                <div className="flex gap-6 text-center">
                  {userProfile.role === 'farmer' && userProfile.stats.totalProducts !== undefined && (
                    <div>
                      <div className="text-2xl font-bold text-primary">{userProfile.stats.totalProducts}</div>
                      <div className="text-sm text-gray-600">Products</div>
                    </div>
                  )}
                  
                  {userProfile.role === 'supplier' && userProfile.stats.totalResources !== undefined && (
                    <div>
                      <div className="text-2xl font-bold text-primary">{userProfile.stats.totalResources}</div>
                      <div className="text-sm text-gray-600">Resources</div>
                    </div>
                  )}

                  {userProfile.stats.totalSales !== undefined && (
                    <div>
                      <div className="text-2xl font-bold text-primary">{userProfile.stats.totalSales}</div>
                      <div className="text-sm text-gray-600">Total Sales</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${userProfile.role === 'farmer' ? 'grid-cols-2' : userProfile.role === 'supplier' ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {(userProfile.role === 'farmer' || products.length > 0) && (
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Sprout className="h-4 w-4" />
                Products ({products.length})
              </TabsTrigger>
            )}
            {(userProfile.role === 'supplier' || resources.length > 0) && (
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Resources ({resources.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Products */}
              {products.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sprout className="h-5 w-5" />
                      Recent Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {products.slice(0, 3).map((product) => (
                        <div key={product._id} className="flex gap-3">
                          <img
                            src={product.images?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-16 h-16 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                            <p className="text-sm font-medium text-primary">
                              {product.pricing.price} {product.pricing.currency}/{product.pricing.unit}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Resources */}
              {resources.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Recent Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {resources.slice(0, 3).map((resource) => (
                        <div key={resource._id} className="flex gap-3">
                          <img
                            src={resource.images?.[0] || "/placeholder.svg"}
                            alt={resource.name}
                            className="w-16 h-16 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{resource.name}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>
                            <p className="text-sm font-medium text-primary">
                              {resource.pricing.price} {resource.pricing.currency}/{resource.pricing.unit}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <UserItemsGrid
              items={products}
              itemType="products"
              isCurrentUser={isCurrentUser}
              onItemDelete={(itemId) => handleItemDelete(itemId, 'products')}
            />
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <UserItemsGrid
              items={resources}
              itemType="resources"
              isCurrentUser={isCurrentUser}
              onItemDelete={(itemId) => handleItemDelete(itemId, 'resources')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}