"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DashboardNav } from "@/components/dashboard-nav"
import { WorkingUserMenu } from "@/components/working-user-menu"
import { MapPin, Save, User, Mail, Phone, MapIcon } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

// Composant carte simple avec coordonnées manuelles
function LocationMap({ coordinates, onLocationChange }: { 
  coordinates: { lat: number, lng: number }, 
  onLocationChange: (lat: number, lng: number) => void 
}) {
  const [tempLat, setTempLat] = useState(coordinates.lat.toString())
  const [tempLng, setTempLng] = useState(coordinates.lng.toString())

  const handleCoordinateUpdate = () => {
    const lat = parseFloat(tempLat)
    const lng = parseFloat(tempLng)
    
    if (!isNaN(lat) && !isNaN(lng)) {
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        onLocationChange(lat, lng)
      } else {
        toast.error('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180')
      }
    }
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setTempLat(lat.toString())
          setTempLng(lng.toString())
          onLocationChange(lat, lng)
          toast.success('Location updated from GPS')
        },
        (error) => {
          toast.error('Unable to get current location: ' + error.message)
        }
      )
    } else {
      toast.error('Geolocation is not supported by this browser')
    }
  }

  return (
    <div className="space-y-4">
      <Label>Farm Location</Label>
      
      {/* Carte statique avec OpenStreetMap */}
      <div className="h-64 w-full rounded-md border overflow-hidden">
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng-0.01},${coordinates.lat-0.01},${coordinates.lng+0.01},${coordinates.lat+0.01}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          title="Location Map"
        />
      </div>

      {/* Contrôles des coordonnées */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            value={tempLat}
            onChange={(e) => setTempLat(e.target.value)}
            placeholder="Latitude (ex: 36.8065)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            value={tempLng}
            onChange={(e) => setTempLng(e.target.value)}
            placeholder="Longitude (ex: 10.1815)"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCoordinateUpdate}
          className="flex items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          Update Location
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleGetCurrentLocation}
          className="flex items-center gap-2"
        >
          <MapIcon className="h-4 w-4" />
          Use My Location
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Current coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
      </p>
      <p className="text-xs text-muted-foreground">
        You can get coordinates from Google Maps by right-clicking on your location and copying the coordinates.
      </p>
    </div>
  )
}

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      location: {
        governorate: '',
        city: '',
        address: '',
        coordinates: {
          lat: 36.8065, // Default to Tunisia center
          lng: 10.1815
        }
      },
      gender: '',
      languages: [] as string[],
      interests: [] as string[]
    },
    farmerProfile: {
      farmName: '',
      farmSize: 0,
      farmingExperience: 0,
      specializations: [] as string[],
      certifications: [] as string[]
    }
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      setFormData({
        profile: {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          location: {
            governorate: user.location?.governorate || '',
            city: user.location?.city || '',
            address: user.location?.address || '',
            coordinates: {
              lat: user.location?.coordinates?.lat || 36.8065,
              lng: user.location?.coordinates?.lng || 10.1815
            }
          },
          gender: user.gender || '',
          languages: user.languages || [],
          interests: user.interests || []
        },
        farmerProfile: {
          farmName: user.farmerProfile?.farmName || '',
          farmSize: user.farmerProfile?.farmSize || 0,
          farmingExperience: user.farmerProfile?.farmingExperience || 0,
          specializations: user.farmerProfile?.specializations || [],
          certifications: user.farmerProfile?.certifications || []
        }
      })
    }
  }, [user])

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        location: {
          ...prev.profile.location,
          coordinates: { lat, lng }
        }
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const result = await response.json()
      
      // Mettre à jour le localStorage avec les nouvelles données
      localStorage.setItem('user_profile', JSON.stringify(result.user))
      
      toast.success('Profile updated successfully!')
      
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const tunisianGovernorates = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte',
    'Béja', 'Jendouba', 'Kef', 'Siliana', 'Kairouan', 'Kasserine', 'Sidi Bouzid',
    'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Gafsa', 'Tozeur', 'Kebili',
    'Gabès', 'Medenine', 'Tataouine'
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
          <div className="ml-auto">
            <WorkingUserMenu />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.profile.firstName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, firstName: e.target.value }
                    }))}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.profile.lastName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, lastName: e.target.value }
                    }))}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.profile.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, phone: e.target.value }
                    }))}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </CardTitle>
              <CardDescription>
                Set your location and farm coordinates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="governorate">Governorate</Label>
                  <Select
                    value={formData.profile.location.governorate}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      profile: {
                        ...prev.profile,
                        location: { ...prev.profile.location, governorate: value }
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select governorate" />
                    </SelectTrigger>
                    <SelectContent>
                      {tunisianGovernorates.map(gov => (
                        <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.profile.location.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      profile: {
                        ...prev.profile,
                        location: { ...prev.profile.location, city: e.target.value }
                      }
                    }))}
                    placeholder="Enter your city"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.profile.location.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    profile: {
                      ...prev.profile,
                      location: { ...prev.profile.location, address: e.target.value }
                    }
                  }))}
                  placeholder="Enter your full address"
                  className="min-h-[60px]"
                />
              </div>

              <LocationMap 
                coordinates={formData.profile.location.coordinates}
                onLocationChange={handleLocationChange}
              />
            </CardContent>
          </Card>

          {/* Farmer Profile (only for farmers) */}
          {user.role === 'farmer' && (
            <Card>
              <CardHeader>
                <CardTitle>Farm Information</CardTitle>
                <CardDescription>
                  Update your farm details and specializations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmName">Farm Name</Label>
                    <Input
                      id="farmName"
                      value={formData.farmerProfile.farmName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        farmerProfile: { ...prev.farmerProfile, farmName: e.target.value }
                      }))}
                      placeholder="Enter your farm name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size (hectares)</Label>
                    <Input
                      id="farmSize"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.farmerProfile.farmSize}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        farmerProfile: { ...prev.farmerProfile, farmSize: parseFloat(e.target.value) || 0 }
                      }))}
                      placeholder="Enter farm size"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Farming Experience (years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.farmerProfile.farmingExperience}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      farmerProfile: { ...prev.farmerProfile, farmingExperience: parseInt(e.target.value) || 0 }
                    }))}
                    placeholder="Years of farming experience"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}