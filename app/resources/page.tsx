"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, MapPin, Package, Filter, Star } from "lucide-react"
import { AddResourceForm } from "@/components/add-resource-form"
import { useUserRole } from "@/hooks/use-user-role"
import { DashboardNav } from "@/components/dashboard-nav"

interface Resource {
  _id: string
  name: string
  description: string
  category: string
  type: string
  images: string[]
  pricing: {
    price: number
    unit: string
    currency: string
    minimumOrder: number
  }
  availability: {
    status: string
    quantity: number
    leadTime: string
  }
  location: {
    governorate: string
    city: string
  }
  supplier: {
    profile: {
      firstName: string
      lastName: string
    }
    role: string
  }
  ratings: {
    averageRating: number
    totalReviews: number
  }
  tags: string[]
  createdAt: string
}

const categories = [
  "All Categories",
  "Seeds",
  "Fertilizers",
  "Pesticides", 
  "Equipment",
  "Tools",
  "Irrigation",
  "Storage",
  "Packaging"
]

const governorates = [
  "All Locations",
  "Tunis",
  "Sfax", 
  "Sousse",
  "Kairouan",
  "Bizerte",
  "Gabès",
  "Ariana",
  "Gafsa"
]

export default function ResourcesPage() {
  const { isSupplier } = useUserRole()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")

  const fetchResources = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory !== "All Categories") params.append('category', selectedCategory)
      if (selectedLocation !== "All Locations") params.append('governorate', selectedLocation)
      
      const response = await fetch(`/api/resources?${params.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        setResources(data.resources || [])
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [searchQuery, selectedCategory, selectedLocation])

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Agricultural Resources</h1>
            <p className="text-muted-foreground">Find the best agricultural supplies and equipment from trusted suppliers</p>
          </div>
          
          {isSupplier && (
            <AddResourceForm />
          )}
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Location Filter */}
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {governorates.map((gov) => (
                    <SelectItem key={gov} value={gov}>
                      {gov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-24 bg-muted rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Resources Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== "All Categories" || selectedLocation !== "All Locations"
                  ? "Try adjusting your filters to find more resources."
                  : "No resources are available at the moment."}
              </p>
              {isSupplier && (
                <AddResourceForm />
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <Card key={resource._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{resource.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {resource.location.city}, {resource.location.governorate}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{resource.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {resource.description}
                  </p>
                  
                  <div className="space-y-3">
                    {/* Price */}
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-primary">
                        {resource.pricing.price} {resource.pricing.currency}/{resource.pricing.unit}
                      </span>
                      <Badge variant={resource.availability.status === 'available' ? 'default' : 'secondary'}>
                        {resource.availability.status}
                      </Badge>
                    </div>
                    
                    {/* Supplier */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        By: {resource.supplier.profile.firstName} {resource.supplier.profile.lastName}
                      </span>
                      {resource.ratings.totalReviews > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{resource.ratings.averageRating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({resource.ratings.totalReviews})</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Tags */}
                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {resource.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{resource.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" className="flex-1">
                        Contact Supplier
                      </Button>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}