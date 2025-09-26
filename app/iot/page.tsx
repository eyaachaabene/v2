"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Droplets,
  Thermometer,
  Wind,
  Sun,
  Zap,
  Wifi,
  WifiOff,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"

// Simulated IoT data
const sensorData = {
  northField: {
    id: "NF001",
    name: "North Field Sensor",
    status: "online",
    lastUpdate: "2 minutes ago",
    soilMoisture: 68,
    soilTemp: 22,
    soilPH: 7.2,
    ambientTemp: 24,
    humidity: 65,
    lightIntensity: 85,
    batteryLevel: 87,
  },
  southField: {
    id: "SF001",
    name: "South Field Sensor",
    status: "online",
    lastUpdate: "1 minute ago",
    soilMoisture: 54,
    soilTemp: 25,
    soilPH: 6.8,
    ambientTemp: 26,
    humidity: 58,
    lightIntensity: 92,
    batteryLevel: 73,
  },
  herbGarden: {
    id: "HG001",
    name: "Herb Garden Sensor",
    status: "offline",
    lastUpdate: "2 hours ago",
    soilMoisture: 45,
    soilTemp: 23,
    soilPH: 7.0,
    ambientTemp: 25,
    humidity: 62,
    lightIntensity: 78,
    batteryLevel: 12,
  },
}

const irrigationZones = [
  {
    id: "zone1",
    name: "North Field - Olive Trees",
    status: "active",
    schedule: "Daily 6:00 AM",
    duration: "45 minutes",
    waterUsage: "245L",
    nextRun: "Tomorrow 6:00 AM",
    autoMode: true,
  },
  {
    id: "zone2",
    name: "South Field - Olive Trees",
    status: "paused",
    schedule: "Daily 6:30 AM",
    duration: "40 minutes",
    waterUsage: "220L",
    nextRun: "Paused due to rain",
    autoMode: true,
  },
  {
    id: "zone3",
    name: "Herb Garden",
    status: "manual",
    schedule: "Twice daily",
    duration: "15 minutes",
    waterUsage: "85L",
    nextRun: "Manual control",
    autoMode: false,
  },
]

const weatherData = {
  current: {
    temperature: 24,
    humidity: 65,
    windSpeed: 12,
    uvIndex: 6,
    condition: "Partly Cloudy",
  },
  forecast: [
    { day: "Today", temp: "24°C", condition: "Partly Cloudy", rain: "10%" },
    { day: "Tomorrow", temp: "22°C", condition: "Rainy", rain: "85%" },
    { day: "Wednesday", temp: "26°C", condition: "Sunny", rain: "5%" },
    { day: "Thursday", temp: "25°C", condition: "Cloudy", rain: "20%" },
  ],
}

export default function IoTPage() {
  const [realTimeData, setRealTimeData] = useState(sensorData)

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData((prev) => ({
        ...prev,
        northField: {
          ...prev.northField,
          soilMoisture: Math.max(50, Math.min(80, prev.northField.soilMoisture + (Math.random() - 0.5) * 2)),
          ambientTemp: Math.max(20, Math.min(30, prev.northField.ambientTemp + (Math.random() - 0.5) * 0.5)),
        },
        southField: {
          ...prev.southField,
          soilMoisture: Math.max(45, Math.min(75, prev.southField.soilMoisture + (Math.random() - 0.5) * 2)),
          ambientTemp: Math.max(20, Math.min(30, prev.southField.ambientTemp + (Math.random() - 0.5) * 0.5)),
        },
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getSensorStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800"
      case "offline":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getIrrigationStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "manual":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">IoT Monitoring</h1>
          <p className="text-muted-foreground">Real-time monitoring and control of your smart farming systems</p>
        </div>

        {/* Quick Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Sensors</p>
                  <p className="text-2xl font-bold text-green-600">2/3</p>
                </div>
                <Wifi className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">1 sensor offline</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Soil Moisture</p>
                  <p className="text-2xl font-bold text-blue-600">61%</p>
                </div>
                <Droplets className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <p className="text-xs text-green-600">+3% from yesterday</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Water Usage Today</p>
                  <p className="text-2xl font-bold text-primary">550L</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="h-3 w-3 text-green-600" />
                <p className="text-xs text-green-600">15% less than usual</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Health</p>
                  <p className="text-2xl font-bold text-green-600">Good</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="sensors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sensors">Sensors</TabsTrigger>
            <TabsTrigger value="irrigation">Irrigation</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="sensors" className="space-y-6">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(realTimeData).map(([key, sensor]) => (
                <Card key={key}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{sensor.name}</CardTitle>
                      <Badge className={getSensorStatusColor(sensor.status)}>
                        {sensor.status === "online" ? (
                          <Wifi className="h-3 w-3 mr-1" />
                        ) : (
                          <WifiOff className="h-3 w-3 mr-1" />
                        )}
                        {sensor.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      ID: {sensor.id} • Updated {sensor.lastUpdate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Soil Moisture */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Soil Moisture</span>
                        </div>
                        <span className="text-sm font-bold">{sensor.soilMoisture}%</span>
                      </div>
                      <Progress value={sensor.soilMoisture} className="h-2" />
                      <p className="text-xs text-muted-foreground">Optimal: 60-80%</p>
                    </div>

                    {/* Temperature */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-orange-600" />
                          <span className="text-xs font-medium">Soil Temp</span>
                        </div>
                        <p className="text-lg font-bold">{sensor.soilTemp}°C</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4 text-yellow-600" />
                          <span className="text-xs font-medium">Air Temp</span>
                        </div>
                        <p className="text-lg font-bold">{sensor.ambientTemp}°C</p>
                      </div>
                    </div>

                    {/* Additional Metrics */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <p className="text-muted-foreground">pH Level</p>
                        <p className="font-semibold">{sensor.soilPH}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Humidity</p>
                        <p className="font-semibold">{sensor.humidity}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Light</p>
                        <p className="font-semibold">{sensor.lightIntensity}%</p>
                      </div>
                    </div>

                    {/* Battery Level */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Battery</span>
                        </div>
                        <span className="text-sm font-bold">{sensor.batteryLevel}%</span>
                      </div>
                      <Progress value={sensor.batteryLevel} className="h-2" />
                      {sensor.batteryLevel < 20 && <p className="text-xs text-red-600">Low battery - replace soon</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="irrigation" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {irrigationZones.map((zone) => (
                <Card key={zone.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{zone.name}</CardTitle>
                      <Badge className={getIrrigationStatusColor(zone.status)}>{zone.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Schedule</p>
                        <p className="font-medium">{zone.schedule}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">{zone.duration}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Water Usage</p>
                        <p className="font-medium">{zone.waterUsage}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Next Run</p>
                        <p className="font-medium">{zone.nextRun}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Switch checked={zone.autoMode} />
                        <Label className="text-sm">Auto Mode</Label>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="sm" disabled={zone.status === "active"}>
                          {zone.status === "active" ? "Running..." : "Start Now"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weather" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Current Weather */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Conditions</CardTitle>
                  <CardDescription>Real-time weather data for your location</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold">{weatherData.current.temperature}°C</p>
                    <p className="text-muted-foreground">{weatherData.current.condition}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Droplets className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-sm text-muted-foreground">Humidity</p>
                      <p className="font-semibold">{weatherData.current.humidity}%</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Wind className="h-4 w-4 text-gray-600" />
                      </div>
                      <p className="text-sm text-muted-foreground">Wind</p>
                      <p className="font-semibold">{weatherData.current.windSpeed} km/h</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Sun className="h-4 w-4 text-yellow-600" />
                      </div>
                      <p className="text-sm text-muted-foreground">UV Index</p>
                      <p className="font-semibold">{weatherData.current.uvIndex}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weather Forecast */}
              <Card>
                <CardHeader>
                  <CardTitle>4-Day Forecast</CardTitle>
                  <CardDescription>Plan your farming activities ahead</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weatherData.forecast.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="w-12 text-sm font-medium">{day.day}</div>
                          <div>
                            <p className="font-medium">{day.condition}</p>
                            <p className="text-sm text-muted-foreground">Rain: {day.rain}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{day.temp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900">Low Battery Alert</h4>
                      <p className="text-sm text-red-700">
                        Herb Garden Sensor (HG001) battery is at 12%. Replace battery soon to avoid data loss.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">2 hours ago</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Acknowledge
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Droplets className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900">Irrigation Paused</h4>
                      <p className="text-sm text-blue-700">
                        South Field irrigation automatically paused due to incoming rain forecast (85% chance).
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">5 hours ago</p>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900">Irrigation Completed</h4>
                      <p className="text-sm text-green-700">
                        North Field irrigation cycle completed successfully. 245L water used over 45 minutes.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">8 hours ago</p>
                    </div>
                    <Button size="sm" variant="outline">
                      View Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
