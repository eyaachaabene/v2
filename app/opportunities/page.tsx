"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardNav } from "@/components/dashboard-nav"
import { MapPin, Calendar, Users, Briefcase, Search, Clock, DollarSign, Building, GraduationCap } from "lucide-react"

// Demo data for opportunities
const opportunities = [
  {
    id: 1,
    title: "Help with Olive Harvest",
    description: "Looking for experienced workers to help with olive harvest season. Must be available for 2-3 weeks.",
    type: "Seasonal Work",
    location: "Sfax",
    postedBy: "Amina Ben Salem",
    postedByType: "Farmer",
    salary: "25 TND/day",
    duration: "2-3 weeks",
    postedDate: "2 days ago",
    applicants: 12,
    skills: ["Harvesting", "Physical Work", "Agriculture"],
    urgent: true,
  },
  {
    id: 2,
    title: "Seasonal Tomato Picking",
    description: "Need reliable workers for tomato harvest. Experience with greenhouse farming preferred.",
    type: "Seasonal Work",
    location: "Bizerte",
    postedBy: "Fatma Khelifi",
    postedByType: "Farmer",
    salary: "30 TND/day",
    duration: "1 month",
    postedDate: "1 week ago",
    applicants: 8,
    skills: ["Harvesting", "Greenhouse", "Quality Control"],
  },
  {
    id: 3,
    title: "NGO Training Program: Modern Farming Techniques",
    description: "Free training program on sustainable farming practices, irrigation management, and crop rotation.",
    type: "Training",
    location: "Tunis",
    postedBy: "Agricultural Development NGO",
    postedByType: "NGO",
    salary: "Free + Certificate",
    duration: "3 days",
    postedDate: "3 days ago",
    applicants: 45,
    skills: ["Learning", "Sustainability", "Irrigation"],
    featured: true,
  },
  {
    id: 4,
    title: "Organic Vegetable Farm Assistant",
    description:
      "Part-time position helping with organic vegetable production. Great for learning sustainable practices.",
    type: "Part-time Job",
    location: "Kairouan",
    postedBy: "Green Valley Farm",
    postedByType: "Partner",
    salary: "800 TND/month",
    duration: "6 months",
    postedDate: "5 days ago",
    applicants: 15,
    skills: ["Organic Farming", "Vegetables", "Sustainability"],
  },
  {
    id: 5,
    title: "Women's Cooperative Leadership Workshop",
    description: "Leadership and business skills workshop specifically designed for women in agriculture.",
    type: "Workshop",
    location: "Sousse",
    postedBy: "UN Women Tunisia",
    postedByType: "NGO",
    salary: "Free + Networking",
    duration: "2 days",
    postedDate: "1 day ago",
    applicants: 28,
    skills: ["Leadership", "Business", "Networking"],
    featured: true,
  },
  {
    id: 6,
    title: "Smart Irrigation System Installation",
    description: "Help needed to install IoT irrigation systems. Technical training will be provided.",
    type: "Technical Work",
    location: "Monastir",
    postedBy: "AgriTech Solutions",
    postedByType: "Partner",
    salary: "40 TND/day",
    duration: "2 weeks",
    postedDate: "4 days ago",
    applicants: 6,
    skills: ["Technical", "IoT", "Installation"],
  },
]

export default function OpportunitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = locationFilter === "all" || opp.location === locationFilter
    const matchesType = typeFilter === "all" || opp.type === typeFilter

    return matchesSearch && matchesLocation && matchesType
  })

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
                  <SelectItem value="Sfax">Sfax</SelectItem>
                  <SelectItem value="Tunis">Tunis</SelectItem>
                  <SelectItem value="Bizerte">Bizerte</SelectItem>
                  <SelectItem value="Kairouan">Kairouan</SelectItem>
                  <SelectItem value="Sousse">Sousse</SelectItem>
                  <SelectItem value="Monastir">Monastir</SelectItem>
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
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredOpportunities.length} of {opportunities.length} opportunities
          </p>
        </div>

        {/* Opportunities Grid */}
        <div className="grid gap-6">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(opportunity.type)}>
                        {getTypeIcon(opportunity.type)}
                        <span className="ml-1">{opportunity.type}</span>
                      </Badge>
                      {opportunity.urgent && <Badge variant="destructive">Urgent</Badge>}
                      {opportunity.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Featured</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">{opportunity.title}</CardTitle>
                    <p className="text-muted-foreground text-sm leading-relaxed">{opportunity.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{opportunity.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span>
                        {opportunity.postedBy} ({opportunity.postedByType})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{opportunity.duration}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>{opportunity.salary}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{opportunity.applicants} applicants</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Posted {opportunity.postedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {opportunity.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button className="flex-1">Apply Now</Button>
                  <Button variant="outline">Save</Button>
                  <Button variant="outline">Share</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredOpportunities.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
              <Button variant="outline">Clear Filters</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
