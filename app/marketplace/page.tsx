"use client"

import { useState, useEffect } from "react"

interface Product {
  _id: string
  name: string
  description: string
  pricing: {
    price: number
    unit: string
    currency: string
  }
  category: string
  subcategory?: string
  farmer: {
    name: string
    rating: number
    reviews: number
  }
  images: string[]
  availability: {
    status: "In Stock" | "Limited" | "Out of Stock" | "Seasonal"
    quantity: number
  }
  location: {
    governorate: string
    city: string
    coordinates: {
      latitude: number
      longitude: number
    }
  }
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface Resource {
  _id: string
  name: string
  description: string
  category: string // "Tools", "Pesticides", "Seeds", "Fertilizers", "Machinery", "Irrigation Equipment"
  type: string
  images: string[]
  pricing: {
    price: number
    unit: string // "piece", "kg", "L", "package"
    currency: string
    minimumOrder: number
    bulkDiscounts?: {
      quantity: number
      discountPercentage: number
    }[]
  }
  specifications: {
    brand: string
    model: string
    manufacturer: string
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
    certifications: string[]
  }
  availability: {
    status: string // "In Stock", "Limited", "Out of Stock", "Pre-order"
    quantity: number
    leadTime: string
    shippingInfo: {
      methods: string[]
      costs: any
    }
  }
  location: {
    governorate: string
    city: string
    coordinates: {
      lat: number
      lng: number
    }
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
    ratingDistribution: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
  }
  tags: string[]
  createdAt: string
  updatedAt: string
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, Star, MessageCircle, Phone, Sprout, Package, Users, Heart } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"
import { ChatbotWidget } from "@/components/chatbot-widget"
import { useProducts } from "@/hooks/use-products"
import { useResources } from "@/hooks/use-resources"

export default function MarketplacePage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedCategory, setSelectedCategory] = useState("all")
	const [selectedRegion, setSelectedRegion] = useState("all")
	const [activeTab, setActiveTab] = useState("products")

	const [products, setProducts] = useState<Product[]>([])
	const [resources, setResources] = useState<Resource[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Handle filter changes
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			try {
				// Build URL with filter parameters
				const url = new URL(`/api/${activeTab}`, window.location.origin)
				
				// Only add valid filter parameters
				if (selectedCategory && selectedCategory !== 'all') {
					url.searchParams.set('category', selectedCategory)
				}
				if (selectedRegion && selectedRegion !== 'all') {
					url.searchParams.set('governorate', selectedRegion)
				}

				console.log(`Fetching ${activeTab} with params:`, {
					category: selectedCategory !== 'all' ? selectedCategory : null,
					governorate: selectedRegion !== 'all' ? selectedRegion : null,
					searchParams: Object.fromEntries(url.searchParams.entries()),
					url: url.toString()
				})

				const response = await fetch(url)
				if (!response.ok) throw new Error(`Failed to fetch ${activeTab}`)
				const data = await response.json()
				
				if (activeTab === 'products') {
					setProducts(data.products)
					setError(null)
				} else {
					setResources(data.resources)
					setError(null)
				}
			} catch (error) {
				console.error(`Error fetching ${activeTab}:`, error)
				setError(error instanceof Error ? error.message : "An error occurred")
				if (activeTab === 'products') {
					setProducts([])
				} else {
					setResources([])
				}
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [selectedCategory, selectedRegion, activeTab])
	
	// Loading and error states are handled in the useEffect hook

	const productCategories = [
		"all",
		...Array.from(new Set((Array.isArray(products) && products.length > 0 ? products : []).map((p) => p.category))),
	];

	const resourceCategories = [
		"all",
		...Array.from(new Set((Array.isArray(resources) && resources.length > 0 ? resources : []).map((r) => r.category))),
	];

	const categories = activeTab === "products" ? productCategories : resourceCategories;

	const regions = [
		"all",
		...Array.from(new Set([
			...(Array.isArray(products) && products.length > 0 ? products.map(p => p.location?.governorate) : []),
			...(Array.isArray(resources) && resources.length > 0 ? resources.map(r => r.location?.governorate) : [])
		].filter(Boolean)))
	];

	const filteredProducts = products.filter((product: Product) => {
		const matchesSearch =
			product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			product.farmer.name.toLowerCase().includes(searchQuery.toLowerCase())
		return matchesSearch
	})

	if (loading) {
		return (
			<div className="min-h-screen bg-background">
				<DashboardNav />
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-center min-h-[400px]">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
							<p className="text-muted-foreground">Loading marketplace...</p>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="min-h-screen bg-background">
				<DashboardNav />
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-center min-h-[400px]">
						<div className="text-center">
							<p className="text-red-600 mb-4">Error loading marketplace: {error}</p>
							<Button onClick={() => window.location.reload()}>Try Again</Button>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-background">
			<DashboardNav />
			<div className="container mx-auto px-4 py-6">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground mb-2">Marketplace</h1>
					<p className="text-muted-foreground">
						Discover fresh products from local farmers and connect with agricultural resources
					</p>
				</div>

				{/* Search and Filters */}
				<Card className="mb-8">
					<CardContent className="p-6">
						<div className="flex flex-col md:flex-row gap-4">
							<div className="flex-1 relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search products, farmers, or locations..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
							<Select 
								value={selectedCategory} 
								onValueChange={(value) => {
									console.log('Category changed to:', value)
									setSelectedCategory(value)
								}}
							>
								<SelectTrigger className="w-full md:w-48">
									<SelectValue placeholder="Category" />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem key={category} value={category}>
											{category === "all" ? "All Categories" : category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select 
								value={selectedRegion} 
								onValueChange={(value) => {
									console.log('Region changed to:', value)
									setSelectedRegion(value)
								}}
							>
								<SelectTrigger className="w-full md:w-48">
									<SelectValue placeholder="Location" />
								</SelectTrigger>
								<SelectContent>
									{regions.map((region) => (
										<SelectItem key={region} value={region}>
											{region === "all" ? "All Locations" : region}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Main Content */}
				<Tabs defaultValue="products" className="space-y-6" onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="products" className="flex items-center gap-2">
							<Package className="h-4 w-4" />
							Products ({filteredProducts.length})
						</TabsTrigger>
						<TabsTrigger value="resources" className="flex items-center gap-2">
							<Heart className="h-4 w-4" />
							Resources ({
								Array.isArray(resources) ? 
									resources.filter(r => 
										(selectedCategory === "all" || r.category === selectedCategory) &&
										(selectedRegion === "all" || r.location.governorate === selectedRegion)
									).length : 0
							})
						</TabsTrigger>
					</TabsList>

					<TabsContent value="products">
						{filteredProducts.length === 0 ? (
							<div className="text-center py-12">
								<Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<h3 className="text-lg font-medium mb-2">No products found</h3>
								<p className="text-muted-foreground">
									{products.length === 0
										? "No products available in the marketplace yet."
										: "Try adjusting your search filters."}
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredProducts.map((product) => (
									<Card key={product._id} className="hover:shadow-lg transition-shadow">
										<div className="aspect-video relative overflow-hidden rounded-t-lg">
											<img
												src={product.images[0] || "/placeholder.svg?height=200&width=300&query=farm product"}
												alt={product.name}
												className="w-full h-full object-cover"
											/>
											<Badge
												className={`absolute top-3 right-3 ${
													product.availability.status === "In Stock"
														? "bg-green-100 text-green-800"
														: product.availability.status === "Limited"
														? "bg-yellow-100 text-yellow-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{product.availability.status}
											</Badge>
										</div>
										<CardContent className="p-6">
											<div className="space-y-3">
												<div>
													<h3 className="text-lg font-semibold">{product.name}</h3>
													<p className="text-sm text-muted-foreground">{product.description}</p>
												</div>

												<div className="flex items-center gap-2 text-sm text-muted-foreground">
													<Sprout className="h-4 w-4" />
													<span>{product.farmer.name}</span>
													<span>•</span>
													<MapPin className="h-4 w-4" />
													<span>{product.location.governorate}</span>
												</div>

												<div className="flex items-center gap-2">
													<div className="flex items-center gap-1">
														<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
														<span className="text-sm font-medium">{product.farmer.rating}</span>
														<span className="text-sm text-muted-foreground">({product.farmer.reviews})</span>
													</div>
												</div>

												<div className="flex flex-wrap gap-1">
													{product.tags.map((tag: string) => (
														<Badge key={tag} variant="secondary" className="text-xs">
															{tag}
														</Badge>
													))}
												</div>

												<div className="flex items-center justify-between pt-3 border-t">
													<span className="text-xl font-bold text-primary">
														{product.pricing.price} {product.pricing.currency}/{product.pricing.unit}
													</span>
													<div className="flex gap-2">
														<Button size="sm" variant="outline">
															<MessageCircle className="h-4 w-4" />
														</Button>
														<Button size="sm" variant="outline">
															<Phone className="h-4 w-4" />
														</Button>
														<Button size="sm">Contact</Button>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</TabsContent>

					<TabsContent value="resources">
						{resources.length === 0 ? (
							<div className="text-center py-12">
								<Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<h3 className="text-lg font-medium mb-2">No resources found</h3>
								<p className="text-muted-foreground">
									Try adjusting your search filters or check back later for new farming resources.
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{resources.map((resource) => (
									<Card key={resource._id} className="hover:shadow-lg transition-shadow">
										<div className="aspect-video relative overflow-hidden rounded-t-lg">
											<img
												src={resource.images[0] || "/placeholder.svg?height=200&width=300&query=farm resource"}
												alt={resource.name}
												className="w-full h-full object-cover"
											/>
											<Badge
												className={`absolute top-3 right-3 ${
													resource.availability.status === "In Stock"
														? "bg-green-100 text-green-800"
														: resource.availability.status === "Limited"
														? "bg-yellow-100 text-yellow-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{resource.availability.status}
											</Badge>
										</div>
										<CardContent className="p-6">
											<div className="space-y-3">
												<div>
													<h3 className="text-lg font-semibold">{resource.name}</h3>
													<p className="text-sm text-muted-foreground">{resource.description}</p>
												</div>

												<div className="flex items-center gap-2 text-sm text-muted-foreground">
													<Package className="h-4 w-4" />
													<span>{resource.type}</span>
													<span>•</span>
													<MapPin className="h-4 w-4" />
													<span>{resource.location.governorate}</span>
												</div>

												<div className="flex items-center gap-2">
													<div className="flex items-center gap-1">
														<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
														<span className="text-sm font-medium">{resource.ratings.averageRating}</span>
														<span className="text-sm text-muted-foreground">({resource.ratings.totalReviews})</span>
													</div>
												</div>

												<div className="text-sm space-y-2">
													<div>
														<span className="text-muted-foreground">Brand: </span>
														<span className="font-medium">{resource.specifications.brand}</span>
													</div>
													{resource.specifications.certifications?.length > 0 && (
														<div>
															<span className="text-muted-foreground">Certifications: </span>
															<span className="font-medium">{resource.specifications.certifications.join(", ")}</span>
														</div>
													)}
												</div>

												<div className="flex flex-wrap gap-1">
													{resource.tags.map((tag: string) => (
														<Badge key={tag} variant="secondary" className="text-xs">
															{tag}
														</Badge>
													))}
												</div>

												<div className="flex items-center justify-between pt-3 border-t">
													<div className="space-y-1">
														<span className="text-xl font-bold text-primary">
															{resource.pricing.price} {resource.pricing.currency}/{resource.pricing.unit}
														</span>
														{resource.pricing.minimumOrder > 1 && (
															<p className="text-xs text-muted-foreground">
																Min. order: {resource.pricing.minimumOrder} {resource.pricing.unit}
															</p>
														)}
													</div>
													<div className="flex gap-2">
														<Button size="sm" variant="outline">
															<MessageCircle className="h-4 w-4" />
														</Button>
														<Button size="sm">Order Now</Button>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</TabsContent>
				</Tabs>
			</div>

			<ChatbotWidget />
		</div>
	)
}
