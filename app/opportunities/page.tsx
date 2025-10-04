"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardNav } from "@/components/dashboard-nav"
import { MapPin, Calendar, Users, Briefcase, Search, Clock, DollarSign, Building, GraduationCap, Loader2 } from "lucide-react"
import { useOpportunities } from "@/hooks/use-opportunities"
import { OpportunityCard } from "@/components/opportunity-card"

export default function OpportunitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Use the custom hook to fetch opportunities
  const { opportunities, locations, loading, error, refetch } = useOpportunities({
    search: searchTerm,
    location: locationFilter,
    type: typeFilter === "all" ? undefined : typeFilter.toLowerCase().replace(/ /g, "_").replace(/-/g, "_"),
    page: 1,
    limit: 20,
  })

  const handleClearFilters = () => {
    setSearchTerm("")
    setLocationFilter("all")
    setTypeFilter("all")
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Seasonal Work":
      case "Part-time Job":
      case "Technical Work":
        return <Briefcase className="h-4 w-4" />
      case "Training":
      case "Workshop":
        return <GraduationCap className="h-4 w-4" />
      default:
        return <Briefcase className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Seasonal Work":
        return "bg-green-100 text-green-800 border-green-200"
      case "Training":
      case "Workshop":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Part-time Job":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Technical Work":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Opportunities Hub</h1>
          <p className="text-muted-foreground">
            Discover jobs, training programs, and partnership opportunities in agriculture
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Seasonal Work">Seasonal Work</SelectItem>
                  <SelectItem value="Part-time Job">Part-time Job</SelectItem>
                  <SelectItem value="Technical Work">Technical Work</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            {loading ? "Loading..." : `Showing ${opportunities.length} opportunities`}
          </p>
          {(searchTerm || locationFilter !== "all" || typeFilter !== "all") && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="text-center py-12 border-destructive">
            <CardContent>
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </CardContent>
          </Card>
        )}

        {/* Opportunities Grid */}
        {!loading && !error && opportunities.length > 0 && (
          <div className="grid gap-6">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity._id?.toString()}
                opportunity={opportunity}
                onApplySuccess={() => refetch()}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && opportunities.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
