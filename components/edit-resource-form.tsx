"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Upload, Edit } from "lucide-react"
import { toast } from "sonner"

const resourceCategories = [
  "Machinery",
  "Seeds",
  "Fertilizers", 
  "Pesticides",
  "Equipment",
  "Tools",
  "Irrigation",
  "Storage",
  "Packaging"
]

const resourceTypes = {
  "Machinery": ["Tractors", "Farm Vehicles", "Harvesters", "Cultivators", "Plows"],
  "Seeds": ["Vegetable Seeds", "Fruit Seeds", "Grain Seeds", "Herb Seeds"],
  "Fertilizers": ["Organic Fertilizer", "Chemical Fertilizer", "Liquid Fertilizer", "Granular Fertilizer"],
  "Pesticides": ["Insecticide", "Herbicide", "Fungicide", "Natural Pesticide"],
  "Equipment": ["Hand Tools", "Power Tools", "Measuring Tools", "Pruning Tools"],
  "Tools": ["Hand Tools", "Power Tools", "Measuring Tools", "Pruning Tools"],
  "Irrigation": ["Drip Systems", "Sprinklers", "Pipes", "Pumps"],
  "Storage": ["Containers", "Silos", "Cold Storage", "Warehouses"],
  "Packaging": ["Boxes", "Bags", "Labels", "Wrapping"]
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
    unit: string
    currency: string
    minimumOrder: number
    bulkDiscounts?: { quantity: number; discountPercentage: number }[]
  }
  specifications: {
    brand?: string
    model?: string
    manufacturer?: string
    weight?: number
    dimensions?: {
      length: number
      width: number
      height: number
      unit: string
    }
    activeIngredients?: string[]
    composition?: any
    applicationMethod?: string
    safetyPeriod?: string
    certifications?: string[]
  }
  availability: {
    status: string
    quantity: number
    leadTime: string
    shippingInfo: {
      methods: string[]
      costs: Record<string, number>
    }
  }
  tags: string[]
}

interface EditResourceFormProps {
  resource: Resource
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (id: string, data: Partial<Resource>) => Promise<boolean>
}

export function EditResourceForm({ resource, open, onOpenChange, onUpdate }: EditResourceFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>(resource.images || [])
  const [imageUploading, setImageUploading] = useState(false)
  
  // Form data
  const [name, setName] = useState(resource.name || "")
  const [description, setDescription] = useState(resource.description || "")
  const [category, setCategory] = useState(resource.category || "")
  const [type, setType] = useState(resource.type || "")
  const [tags, setTags] = useState<string[]>(resource.tags || [])
  const [newTag, setNewTag] = useState("")
  
  // Pricing
  const [price, setPrice] = useState<number>(resource.pricing?.price || 0)
  const [unit, setUnit] = useState(resource.pricing?.unit || "")
  const [currency, setCurrency] = useState(resource.pricing?.currency || "TND")
  const [minimumOrder, setMinimumOrder] = useState<number>(resource.pricing?.minimumOrder || 1)
  
  // Specifications
  const [brand, setBrand] = useState(resource.specifications?.brand || "")
  const [model, setModel] = useState(resource.specifications?.model || "")
  const [manufacturer, setManufacturer] = useState(resource.specifications?.manufacturer || "")
  const [weight, setWeight] = useState<number | undefined>(resource.specifications?.weight)
  const [dimensionLength, setDimensionLength] = useState<number>(resource.specifications?.dimensions?.length || 0)
  const [dimensionWidth, setDimensionWidth] = useState<number>(resource.specifications?.dimensions?.width || 0)
  const [dimensionHeight, setDimensionHeight] = useState<number>(resource.specifications?.dimensions?.height || 0)
  const [dimensionUnit, setDimensionUnit] = useState(resource.specifications?.dimensions?.unit || "cm")
  const [activeIngredients, setActiveIngredients] = useState<string[]>(resource.specifications?.activeIngredients || [])
  const [applicationMethod, setApplicationMethod] = useState(resource.specifications?.applicationMethod || "")
  const [safetyPeriod, setSafetyPeriod] = useState(resource.specifications?.safetyPeriod || "")
  const [certifications, setCertifications] = useState<string[]>(resource.specifications?.certifications || [])
  
  // Availability
  const [status, setStatus] = useState(resource.availability?.status || "In Stock")
  const [quantity, setQuantity] = useState<number>(resource.availability?.quantity || 0)
  const [leadTime, setLeadTime] = useState(resource.availability?.leadTime || "1-3 days")
  const [shippingMethods, setShippingMethods] = useState<string[]>(resource.availability?.shippingInfo?.methods || [])

  // Reset form when resource changes
  useEffect(() => {
    if (resource) {
      setName(resource.name || "")
      setDescription(resource.description || "")
      setCategory(resource.category || "")
      setType(resource.type || "")
      setTags(resource.tags || [])
      setUploadedImages(resource.images || [])
      setPrice(resource.pricing?.price || 0)
      setUnit(resource.pricing?.unit || "")
      setCurrency(resource.pricing?.currency || "TND")
      setMinimumOrder(resource.pricing?.minimumOrder || 1)
      setBrand(resource.specifications?.brand || "")
      setModel(resource.specifications?.model || "")
      setManufacturer(resource.specifications?.manufacturer || "")
      setWeight(resource.specifications?.weight)
      setDimensionLength(resource.specifications?.dimensions?.length || 0)
      setDimensionWidth(resource.specifications?.dimensions?.width || 0)
      setDimensionHeight(resource.specifications?.dimensions?.height || 0)
      setDimensionUnit(resource.specifications?.dimensions?.unit || "cm")
      setActiveIngredients(resource.specifications?.activeIngredients || [])
      setApplicationMethod(resource.specifications?.applicationMethod || "")
      setSafetyPeriod(resource.specifications?.safetyPeriod || "")
      setCertifications(resource.specifications?.certifications || [])
      setStatus(resource.availability?.status || "In Stock")
      setQuantity(resource.availability?.quantity || 0)
      setLeadTime(resource.availability?.leadTime || "1-3 days")
      setShippingMethods(resource.availability?.shippingInfo?.methods || [])
    }
  }, [resource])

  // Helper functions
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const addActiveIngredient = (ingredient: string) => {
    if (ingredient.trim() && !activeIngredients.includes(ingredient.trim())) {
      setActiveIngredients([...activeIngredients, ingredient.trim()])
    }
  }

  const addCertification = (cert: string) => {
    if (cert.trim() && !certifications.includes(cert.trim())) {
      setCertifications([...certifications, cert.trim()])
    }
  }

  const addShippingMethod = (method: string) => {
    if (method.trim() && !shippingMethods.includes(method.trim())) {
      setShippingMethods([...shippingMethods, method.trim()])
    }
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setImageUploading(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData()
      formData.append('image', file)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()
        return data.filename
      } catch (error) {
        console.error('Error uploading image:', error)
        toast.error(`Failed to upload ${file.name}`)
        return null
      }
    })

    try {
      const uploadedFilenames = await Promise.all(uploadPromises)
      const validFilenames = uploadedFilenames.filter(filename => filename !== null)
      
      if (validFilenames.length > 0) {
        setUploadedImages(prev => [...prev, ...validFilenames])
        toast.success(`${validFilenames.length} image(s) uploaded successfully`)
      }
    } catch (error) {
      toast.error('Error processing image uploads')
    } finally {
      setImageUploading(false)
    }
  }

  const removeImage = (filename: string) => {
    setUploadedImages(prev => prev.filter(img => img !== filename))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const resourceData = {
        name,
        description,
        category,
        type,
        images: uploadedImages,
        pricing: {
          price,
          unit,
          currency,
          minimumOrder,
          bulkDiscounts: []
        },
        specifications: {
          brand,
          model,
          manufacturer,
          weight,
          dimensions: dimensionLength > 0 || dimensionWidth > 0 || dimensionHeight > 0 ? {
            length: dimensionLength,
            width: dimensionWidth,
            height: dimensionHeight,
            unit: dimensionUnit
          } : undefined,
          activeIngredients,
          composition: {},
          applicationMethod,
          safetyPeriod,
          certifications
        },
        availability: {
          status,
          quantity,
          leadTime,
          shippingInfo: {
            methods: shippingMethods,
            costs: {}
          }
        },
        tags
      }

      const success = await onUpdate(resource._id, resourceData)
      if (success) {
        onOpenChange(false)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update resource')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Resource: {resource.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Resource Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Compact Tractor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={(value) => {
                    setCategory(value)
                    setType("") // Reset type when category changes
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {category && (
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes[category as keyof typeof resourceTypes]?.map((typeOption) => (
                        <SelectItem key={typeOption} value={typeOption}>
                          {typeOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your resource in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Images</CardTitle>
              <CardDescription>Upload images of your resource (max 5 images)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Upload Resource Images</h3>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop images here, or click to select files
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload-edit"
                      disabled={imageUploading || uploadedImages.length >= 5}
                    />
                    <label
                      htmlFor="image-upload-edit"
                      className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 disabled:opacity-50 ${
                        imageUploading || uploadedImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {imageUploading ? 'Uploading...' : 'Choose Images'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {uploadedImages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Current Images:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedImages.map((filename, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border border-border">
                          <img
                            src={filename}
                            alt={`Resource image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(filename)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={price || ""}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Input
                    id="unit"
                    placeholder="kg, piece, liter, etc."
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TND">TND</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minOrder">Minimum Order</Label>
                  <Input
                    id="minOrder"
                    type="number"
                    min="1"
                    value={minimumOrder}
                    onChange={(e) => setMinimumOrder(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Limited">Limited</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      <SelectItem value="Pre-order">Pre-order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity Available</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadTime">Lead Time</Label>
                  <Input
                    id="leadTime"
                    placeholder="e.g., 1-3 days, 1 week"
                    value={leadTime}
                    onChange={(e) => setLeadTime(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Resource'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}