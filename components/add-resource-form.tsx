"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, X, Upload, Package, Trash2 } from "lucide-react"
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

export function AddResourceForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [imageUploading, setImageUploading] = useState(false)
  
  // Form data matching Resource interface
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [type, setType] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  
  // Pricing
  const [price, setPrice] = useState<number>(0)
  const [unit, setUnit] = useState("")
  const [currency, setCurrency] = useState("TND")
  const [minimumOrder, setMinimumOrder] = useState<number>(1)
  const [bulkDiscounts, setBulkDiscounts] = useState<{quantity: number, discountPercentage: number}[]>([])
  
  // Specifications
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [weight, setWeight] = useState<number | undefined>(undefined)
  const [dimensionLength, setDimensionLength] = useState<number>(0)
  const [dimensionWidth, setDimensionWidth] = useState<number>(0)
  const [dimensionHeight, setDimensionHeight] = useState<number>(0)
  const [dimensionUnit, setDimensionUnit] = useState("cm")
  const [activeIngredients, setActiveIngredients] = useState<string[]>([])
  const [composition, setComposition] = useState<any>({})
  const [applicationMethod, setApplicationMethod] = useState("")
  const [safetyPeriod, setSafetyPeriod] = useState("")
  const [certifications, setCertifications] = useState<string[]>([])
  
  // Availability
  const [status, setStatus] = useState("In Stock")
  const [quantity, setQuantity] = useState<number>(0)
  const [leadTime, setLeadTime] = useState("1-3 days")
  const [shippingMethods, setShippingMethods] = useState<string[]>([])
  const [shippingCosts, setShippingCosts] = useState<Record<string, number>>({})

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

  const addBulkDiscount = (qty: number, discount: number) => {
    if (qty > 0 && discount > 0 && discount <= 100) {
      setBulkDiscounts([...bulkDiscounts, { quantity: qty, discountPercentage: discount }])
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
        return data.filename // This will be the full path like /uploads/resources/filename.jpg
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
      const token = localStorage.getItem('auth_token')
      if (!token) {
        toast.error('Please login first')
        return
      }

      // Create resource data matching the Resource interface
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
          bulkDiscounts
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
          composition,
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
            costs: shippingCosts
          }
        },
        tags
      }

      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resourceData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create resource')
      }

      toast.success('Resource added successfully!')
      setOpen(false)
      
      // Reset all form fields
      setName("")
      setDescription("")
      setCategory("")
      setType("")
      setTags([])
      setNewTag("")
      setPrice(0)
      setUnit("")
      setCurrency("TND")
      setMinimumOrder(1)
      setBulkDiscounts([])
      setBrand("")
      setModel("")
      setManufacturer("")
      setWeight(undefined)
      setDimensionLength(0)
      setDimensionWidth(0)
      setDimensionHeight(0)
      setDimensionUnit("cm")
      setActiveIngredients([])
      setComposition({})
      setApplicationMethod("")
      setSafetyPeriod("")
      setCertifications([])
      setStatus("In Stock")
      setQuantity(0)
      setLeadTime("1-3 days")
      setShippingMethods([])
      setShippingCosts({})
      setUploadedImages([])
      
      // Reset input fields
      const inputs = [
        'activeIngredientInput',
        'certificationInput', 
        'shippingMethodInput'
      ]
      inputs.forEach(id => {
        const input = document.getElementById(id) as HTMLInputElement
        if (input) input.value = ''
      })
      
      window.location.reload()
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to add resource')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add New Resource
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
                      id="image-upload"
                      disabled={imageUploading || uploadedImages.length >= 5}
                    />
                    <label
                      htmlFor="image-upload"
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
                  <h4 className="font-medium">Uploaded Images:</h4>
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

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="Brand name"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="Model name/number"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    placeholder="Manufacturer name"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Weight in kg"
                    value={weight || ""}
                    onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="space-y-3">
                <Label>Dimensions (Optional)</Label>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="length">Length</Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Length"
                      value={dimensionLength || ""}
                      onChange={(e) => setDimensionLength(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Width"
                      value={dimensionWidth || ""}
                      onChange={(e) => setDimensionWidth(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Height"
                      value={dimensionHeight || ""}
                      onChange={(e) => setDimensionHeight(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimUnit">Unit</Label>
                    <Select value={dimensionUnit} onValueChange={setDimensionUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="m">m</SelectItem>
                        <SelectItem value="mm">mm</SelectItem>
                        <SelectItem value="in">inches</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Active Ingredients (for pesticides/fertilizers) */}
              {(category === "Pesticides" || category === "Fertilizers") && (
                <div className="space-y-3">
                  <Label>Active Ingredients</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add active ingredient..."
                      id="activeIngredientInput"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.target as HTMLInputElement
                          if (input.value.trim()) {
                            addActiveIngredient(input.value)
                            input.value = ''
                          }
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById('activeIngredientInput') as HTMLInputElement
                        if (input?.value.trim()) {
                          addActiveIngredient(input.value)
                          input.value = ''
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeIngredients.map((ingredient, index) => (
                      <Badge key={`${ingredient}-${index}`} variant="secondary" className="flex items-center gap-1">
                        {ingredient}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => setActiveIngredients(activeIngredients.filter((_, i) => i !== index))}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Application Method & Safety (for pesticides/fertilizers) */}
              {(category === "Pesticides" || category === "Fertilizers") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="applicationMethod">Application Method</Label>
                    <Input
                      id="applicationMethod"
                      placeholder="e.g., Spray, Granular application"
                      value={applicationMethod}
                      onChange={(e) => setApplicationMethod(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="safetyPeriod">Safety Period</Label>
                    <Input
                      id="safetyPeriod"
                      placeholder="e.g., 7 days before harvest"
                      value={safetyPeriod}
                      onChange={(e) => setSafetyPeriod(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Certifications */}
              <div className="space-y-3">
                <Label>Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add certification..."
                    id="certificationInput"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.target as HTMLInputElement
                        if (input.value.trim()) {
                          addCertification(input.value)
                          input.value = ''
                        }
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('certificationInput') as HTMLInputElement
                      if (input?.value.trim()) {
                        addCertification(input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert, index) => (
                    <Badge key={`${cert}-${index}`} variant="secondary" className="flex items-center gap-1">
                      {cert}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setCertifications(certifications.filter((_, i) => i !== index))}
                      />
                    </Badge>
                  ))}
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

              {/* Shipping Methods */}
              <div className="space-y-3">
                <Label>Shipping Methods</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add shipping method..."
                    id="shippingMethodInput"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.target as HTMLInputElement
                        if (input.value.trim()) {
                          addShippingMethod(input.value)
                          input.value = ''
                        }
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('shippingMethodInput') as HTMLInputElement
                      if (input?.value.trim()) {
                        addShippingMethod(input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {shippingMethods.map((method, index) => (
                    <Badge key={`${method}-${index}`} variant="secondary" className="flex items-center gap-1">
                      {method}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setShippingMethods(shippingMethods.filter((_, i) => i !== index))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
              <CardDescription>Add tags to help users find your resource</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Resource'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}