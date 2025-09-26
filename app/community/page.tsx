"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, Plus, MapPin, Clock, Users, BookOpen, TrendingUp } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"

const posts = [
  {
    id: 1,
    author: "Fatma Ben Ali",
    location: "Sfax",
    avatar: "/farmer-avatar-1.jpg",
    time: "2 hours ago",
    content:
      "Just harvested my first batch of olives this season! The IoT sensors helped me optimize watering, and the yield is 20% higher than last year. Happy to share my irrigation schedule with fellow olive growers.",
    tags: ["Olives", "IoT", "Harvest"],
    likes: 24,
    comments: 8,
    image: "/olive-harvest.jpg",
    category: "Success Story",
  },
  {
    id: 2,
    author: "Ahmed Mansouri",
    location: "Sousse",
    avatar: "/farmer-avatar-2.jpg",
    time: "5 hours ago",
    content:
      "Has anyone dealt with aphids on tomato plants this season? I'm seeing some early signs and want to use organic methods. What has worked for you?",
    tags: ["Tomatoes", "Pest Control", "Organic"],
    likes: 12,
    comments: 15,
    category: "Question",
  },
  {
    id: 3,
    author: "Leila Trabelsi",
    location: "Kairouan",
    avatar: "/farmer-avatar-3.jpg",
    time: "1 day ago",
    content:
      "Sharing my grandmother's traditional wheat storage method that keeps grain fresh for months without chemicals. This technique has been in our family for generations.",
    tags: ["Wheat", "Traditional", "Storage"],
    likes: 45,
    comments: 22,
    image: "/wheat-storage.jpg",
    category: "Knowledge Sharing",
  },
  {
    id: 4,
    author: "Omar Khelifi",
    location: "Nabeul",
    avatar: "/farmer-avatar-4.jpg",
    time: "2 days ago",
    content:
      "Weather forecast shows heavy rain next week. Fellow citrus farmers, make sure to check your drainage systems! I learned this the hard way last season.",
    tags: ["Citrus", "Weather", "Prevention"],
    likes: 18,
    comments: 6,
    category: "Weather Alert",
  },
]

const suggestedConnections = [
  {
    id: 1,
    name: "Sonia Gharbi",
    location: "Bizerte",
    avatar: "/farmer-avatar-5.jpg",
    commonTags: ["Herbs", "Organic"],
    mutualConnections: 3,
    description: "Specializes in aromatic herbs and organic farming techniques",
  },
  {
    id: 2,
    name: "Karim Bouazizi",
    location: "Tozeur",
    avatar: "/farmer-avatar-6.jpg",
    commonTags: ["Dates", "Desert Farming"],
    mutualConnections: 1,
    description: "Expert in date cultivation and desert agriculture",
  },
  {
    id: 3,
    name: "Nadia Hamdi",
    location: "Sfax",
    avatar: "/farmer-avatar-7.jpg",
    commonTags: ["Olives", "Sfax"],
    mutualConnections: 5,
    description: "Olive farmer in your region with 15 years experience",
  },
]

const learningResources = [
  {
    id: 1,
    title: "Sustainable Irrigation Techniques",
    provider: "AgriTech Tunisia",
    duration: "45 min",
    level: "Intermediate",
    tags: ["Irrigation", "Water Management"],
    participants: 234,
  },
  {
    id: 2,
    title: "Organic Pest Control Methods",
    provider: "Green Farming Initiative",
    duration: "30 min",
    level: "Beginner",
    tags: ["Organic", "Pest Control"],
    participants: 189,
  },
  {
    id: 3,
    title: "Soil Health and Nutrition",
    provider: "Soil Science Institute",
    duration: "60 min",
    level: "Advanced",
    tags: ["Soil", "Nutrition"],
    participants: 156,
  },
]

export default function CommunityPage() {
  const [newPost, setNewPost] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const availableTags = ["Olives", "Tomatoes", "Wheat", "Citrus", "Herbs", "Dates", "Organic", "IoT", "Weather"]

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Community</h1>
          <p className="text-muted-foreground">Connect with fellow farmers, share knowledge, and grow together</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Share with the Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Share your farming experience, ask a question, or offer advice..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-24"
                />
                <div className="space-y-3">
                  <p className="text-sm font-medium">Add tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm">
                    Add Photo
                  </Button>
                  <Button>Share Post</Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Post Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                            <AvatarFallback>
                              {post.author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{post.author}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{post.location}</span>
                              <span>•</span>
                              <Clock className="h-3 w-3" />
                              <span>{post.time}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">{post.category}</Badge>
                      </div>

                      {/* Post Content */}
                      <p className="text-foreground leading-relaxed">{post.content}</p>

                      {/* Post Image */}
                      {post.image && (
                        <div className="rounded-lg overflow-hidden">
                          <img
                            src={post.image || "/placeholder.svg"}
                            alt="Post image"
                            className="w-full h-64 object-cover"
                          />
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-4">
                          <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            <span>{post.likes}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Share2 className="h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Suggested Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Suggested Connections
                </CardTitle>
                <CardDescription>Farmers you might want to connect with</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestedConnections.map((connection) => (
                  <div key={connection.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={connection.avatar || "/placeholder.svg"} alt={connection.name} />
                        <AvatarFallback>
                          {connection.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{connection.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{connection.location}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{connection.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {connection.commonTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {connection.mutualConnections} mutual connections
                        </p>
                      </div>
                    </div>
                    <Button size="sm" className="w-full">
                      Connect
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Learning Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Learning Resources
                </CardTitle>
                <CardDescription>Recommended training for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {learningResources.map((resource) => (
                  <div key={resource.id} className="space-y-3 pb-4 border-b last:border-b-0">
                    <div>
                      <h4 className="font-medium text-sm">{resource.title}</h4>
                      <p className="text-xs text-muted-foreground">{resource.provider}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{resource.duration}</span>
                      <span>•</span>
                      <span>{resource.level}</span>
                      <span>•</span>
                      <span>{resource.participants} participants</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      Start Learning
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Farmers</span>
                  <span className="font-semibold">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Posts This Week</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Questions Answered</span>
                  <span className="font-semibold">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Your Connections</span>
                  <span className="font-semibold">23</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
