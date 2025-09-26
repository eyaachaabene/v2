"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Droplets,
  Thermometer,
  Cloud,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Sprout,
  DollarSign,
  Users,
  Bell,
  MessageCircle,
  BookOpen,
  Smartphone,
  Briefcase,
  MapPin,
} from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"
import { ChatbotWidget } from "@/components/chatbot-widget"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useSensors } from "@/hooks/use-sensors"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const { sensors, loading: sensorsLoading, error: sensorsError } = useSensors()
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || sensorsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const soilMoisture = sensors.find((s) => s.type === "soil_moisture")?.lastReading?.value || 68
  const temperature = sensors.find((s) => s.type === "temperature")?.lastReading?.value || 24
  const activeTasks = stats?.activeTasks || 3
  const totalRevenue = stats?.totalRevenue || 2450

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {profile?.firstName || "User"}!</h1>
          <p className="text-muted-foreground">
            Empowering your farming journey from soil to market. Here's your farm overview today.
          </p>
        </div>

        {(sensorsError || statsError) && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600 text-sm">
                {sensorsError && `Sensors: ${sensorsError}. `}
                {statsError && `Stats: ${statsError}. `}
                Some data may not be current.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Notifications Section */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Bell className="h-5 w-5" />
              Notifications & Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Briefcase className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900">Perfect Match Found!</p>
                <p className="text-sm text-green-700">
                  You are a good match for "Olive Harvest Helper" in Sfax. Your olive farming experience makes you an
                  ideal candidate.
                </p>
                <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700">
                  View Opportunity
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Cloud className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">Weather Alert</p>
                <p className="text-sm text-blue-700">
                  Rain expected tomorrow (15mm). Your irrigation system has been automatically paused.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Users className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900">New Training Available</p>
                <p className="text-sm text-yellow-700">
                  "Women's Cooperative Leadership Workshop" in Sousse - Free registration open!
                </p>
                <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Soil Moisture</p>
                  <p className="text-2xl font-bold text-primary">{soilMoisture}%</p>
                </div>
                <Droplets className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-4">
                <Progress value={soilMoisture} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">Optimal range: 60-80%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Temperature</p>
                  <p className="text-2xl font-bold text-orange-600">{temperature}°C</p>
                </div>
                <Thermometer className="h-8 w-8 text-orange-600" />
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">Feels like {temperature + 2}°C</p>
                <p className="text-xs text-green-600">Perfect for olive growth</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                  <p className="text-2xl font-bold text-blue-600">{activeTasks}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">2 due this week</p>
                <p className="text-xs text-blue-600">1 overdue</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{totalRevenue} TND</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-4">
                <p className="text-xs text-green-600">+12% from last month</p>
                <p className="text-xs text-muted-foreground">From olive sales</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="iot">IoT Data</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Weather Alert */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Weather Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Rain Expected Tomorrow</p>
                      <p className="text-sm text-blue-700">15mm precipitation. Irrigation automatically paused.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Assistant Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Ask me anything about farming!</p>
                        <p className="text-xs text-muted-foreground">
                          Weather, irrigation, pest control, market prices...
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click the chat button in the bottom-right corner to start a conversation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Irrigation completed</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New buyer inquiry</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Yield prediction updated</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">SMS alert sent: Weather warning</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crop Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sprout className="h-5 w-5" />
                  Crop Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Olive Trees (North Field)</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Healthy
                      </Badge>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-sm text-muted-foreground">Growth: 85% to harvest</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Olive Trees (South Field)</h4>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Attention
                      </Badge>
                    </div>
                    <Progress value={72} className="h-2" />
                    <p className="text-sm text-muted-foreground">Growth: 72% to harvest</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Herb Garden</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Ready
                      </Badge>
                    </div>
                    <Progress value={100} className="h-2" />
                    <p className="text-sm text-muted-foreground">Ready for harvest</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Recommended Opportunities
                </CardTitle>
                <CardDescription>Based on your profile and skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Briefcase className="h-5 w-5 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900">Olive Harvest Helper - Perfect Match!</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Seasonal work in Sfax. Your olive farming experience makes you ideal for this role.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Sfax
                      </span>
                      <span>25 TND/day</span>
                      <span>2-3 weeks</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Apply Now</Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <BookOpen className="h-5 w-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium">Women's Leadership Workshop</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Free leadership training specifically for women in agriculture.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Sousse
                      </span>
                      <span>Free + Certificate</span>
                      <span>2 days</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Register</Button>
                      <Button size="sm" variant="outline">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <Button variant="outline" asChild>
                    <a href="/opportunities">View All Opportunities</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="iot" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Soil Sensors</CardTitle>
                  <CardDescription>Real-time soil conditions across your fields</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sensors.length === 0 ? (
                    <div className="text-center py-8">
                      <Sprout className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No sensors connected yet</p>
                    </div>
                  ) : (
                    sensors.map((sensor) => (
                      <div key={sensor._id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{sensor.name}</span>
                          <Badge
                            variant="secondary"
                            className={
                              sensor.status === "online"
                                ? "bg-green-100 text-green-800"
                                : sensor.status === "offline"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {sensor.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">
                              {sensor.type === "soil_moisture"
                                ? "Moisture"
                                : sensor.type === "temperature"
                                  ? "Temperature"
                                  : sensor.type === "ph"
                                    ? "pH Level"
                                    : "Value"}
                            </p>
                            <p className="font-medium">
                              {sensor.lastReading?.value || "N/A"}
                              {sensor.lastReading?.unit || ""}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Battery</p>
                            <p className="font-medium">{sensor.batteryLevel}%</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Irrigation System */}
              <Card>
                <CardHeader>
                  <CardTitle>Irrigation System</CardTitle>
                  <CardDescription>Automated watering schedule and controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">System Status</span>
                    <Badge className="bg-blue-100 text-blue-800">Paused</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Next scheduled</span>
                      <span className="font-medium">Tomorrow 6:00 AM</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last irrigation</span>
                      <span className="font-medium">Today 6:00 AM</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Water used today</span>
                      <span className="font-medium">245 liters</span>
                    </div>
                  </div>
                  <Button className="w-full bg-transparent" variant="outline">
                    Manual Override
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Stay on top of your farming schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">Pest Control - South Field</h4>
                    <p className="text-sm text-muted-foreground">Apply organic pesticide to olive trees</p>
                    <p className="text-xs text-red-600">Overdue by 2 days</p>
                  </div>
                  <Button size="sm">Mark Done</Button>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">Harvest Herbs</h4>
                    <p className="text-sm text-muted-foreground">Collect basil and mint from herb garden</p>
                    <p className="text-xs text-blue-600">Due tomorrow</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Schedule
                  </Button>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">Soil Testing</h4>
                    <p className="text-sm text-muted-foreground">Monthly soil analysis for nutrient levels</p>
                    <p className="text-xs text-green-600">Due in 5 days</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Micro-Learning Modules */}
          <TabsContent value="learning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Micro-Learning Modules
                </CardTitle>
                <CardDescription>Short training videos and articles to improve your farming skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Droplets className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Water-Efficient Irrigation</h4>
                          <p className="text-sm text-muted-foreground">5 min video</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Learn drip irrigation techniques to save 40% water
                      </p>
                      <Button size="sm" className="w-full">
                        Watch Now
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Market Price Analysis</h4>
                          <p className="text-sm text-muted-foreground">3 min read</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Understanding seasonal price trends for better sales
                      </p>
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        Read Article
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Sprout className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Organic Pest Control</h4>
                          <p className="text-sm text-muted-foreground">7 min video</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Natural methods to protect crops without chemicals
                      </p>
                      <Button size="sm" className="w-full">
                        Watch Now
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Building Buyer Relationships</h4>
                          <p className="text-sm text-muted-foreground">4 min read</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">Tips for long-term partnerships with buyers</p>
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        Read Article
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Yield Tracking</CardTitle>
                  <CardDescription>Monitor your harvest progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Olives (2024)</span>
                      <span className="text-sm text-muted-foreground">850 kg</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <p className="text-xs text-muted-foreground">Target: 1,200 kg (71% achieved)</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Herbs (2024)</span>
                      <span className="text-sm text-muted-foreground">45 kg</span>
                    </div>
                    <Progress value={90} className="h-2" />
                    <p className="text-xs text-muted-foreground">Target: 50 kg (90% achieved)</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                  <CardDescription>Track your farming expenses and revenue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">2,450 TND</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-600">1,200 TND</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Net Profit</span>
                      <span className="text-xl font-bold text-green-600">1,250 TND</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ChatbotWidget />
    </div>
  )
}
