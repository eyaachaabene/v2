"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Phone, Video, Search, Plus, Bot, Bell, Settings, MoreVertical, Paperclip, Smile } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"
import { useFriends } from "@/hooks/use-friends"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

const conversations = [
  {
    id: 1,
    name: "Ahmed Mansouri",
    avatar: "/farmer-avatar-2.jpg",
    lastMessage: "Thanks for the pest control advice! It worked perfectly.",
    time: "2 min ago",
    unread: 0,
    online: true,
    type: "farmer",
  },
  {
    id: 2,
    name: "Olive Buyers Group",
    avatar: "/group-avatar.jpg",
    lastMessage: "Looking for premium olive oil suppliers in Sfax region",
    time: "15 min ago",
    unread: 3,
    online: false,
    type: "group",
  },
  {
    id: 3,
    name: "Green Tunisia NGO",
    avatar: "/ngo-avatar.jpg",
    lastMessage: "New organic farming workshop available next week",
    time: "1 hour ago",
    unread: 1,
    online: true,
    type: "ngo",
  },
  {
    id: 4,
    name: "Leila Trabelsi",
    avatar: "/farmer-avatar-3.jpg",
    lastMessage: "The wheat storage method you shared is amazing!",
    time: "2 hours ago",
    unread: 0,
    online: false,
    type: "farmer",
  },
]

const currentMessages = [
  {
    id: 1,
    sender: "Ahmed Mansouri",
    content: "Hi Fatma! I saw your post about dealing with aphids on tomatoes. Could you share more details?",
    time: "10:30 AM",
    isOwn: false,
  },
  {
    id: 2,
    sender: "You",
    content:
      "Of course! I use a mixture of neem oil and soap water. Spray it early morning or evening. Works great and it's completely organic.",
    time: "10:32 AM",
    isOwn: true,
  },
  {
    id: 3,
    sender: "Ahmed Mansouri",
    content: "That sounds perfect! What's the ratio you use for the mixture?",
    time: "10:35 AM",
    isOwn: false,
  },
  {
    id: 4,
    sender: "You",
    content: "2 tablespoons of neem oil + 1 tablespoon of mild soap in 1 liter of water. Mix well before spraying.",
    time: "10:37 AM",
    isOwn: true,
  },
  {
    id: 5,
    sender: "Ahmed Mansouri",
    content: "Thanks for the pest control advice! It worked perfectly.",
    time: "2 min ago",
    isOwn: false,
  },
]

const smsNotifications = [
  {
    id: 1,
    type: "weather",
    title: "Weather Alert",
    message: "Heavy rain expected tomorrow. Irrigation automatically paused for all zones.",
    time: "1 hour ago",
    status: "sent",
  },
  {
    id: 2,
    type: "iot",
    title: "Sensor Alert",
    message: "North Field soil moisture dropped to 45%. Consider manual irrigation.",
    time: "3 hours ago",
    status: "sent",
  },
  {
    id: 3,
    type: "marketplace",
    title: "New Inquiry",
    message: "Buyer interested in your olive oil. Check marketplace for details.",
    time: "5 hours ago",
    status: "sent",
  },
  {
    id: 4,
    type: "task",
    title: "Task Reminder",
    message: "Pest control for South Field is overdue by 2 days.",
    time: "1 day ago",
    status: "sent",
  },
]

const chatbotSuggestions = [
  "How to improve soil health?",
  "Best irrigation schedule for olives",
  "Organic pest control methods",
  "Weather forecast for this week",
  "Market prices for my crops",
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [newMessage, setNewMessage] = useState("")
  const [chatbotMessage, setChatbotMessage] = useState("")
  const [friendConversations, setFriendConversations] = useState<any[]>([])
  
  const { friends, isLoading: friendsLoading, getTotalUnreadMessages } = useFriends()
  const { user } = useAuth()
  const { toast } = useToast()

  // Convert friends to conversation format
  useEffect(() => {
    if (friends) {
      const conversations = friends.map(friend => ({
        id: friend._id,
        name: `${friend.profile.firstName} ${friend.profile.lastName}`,
        avatar: friend.profile.avatar || "/placeholder-user.jpg",
        lastMessage: friend.lastMessageAt ? "Continue your conversation..." : "Start a conversation!",
        time: friend.lastMessageAt ? formatTime(friend.lastMessageAt) : "New",
        unread: friend.unreadMessages || 0,
        online: friend.isOnline,
        type: "friend",
        location: friend.profile.location
      }))
      setFriendConversations(conversations)
      
      // Auto-select first conversation if none selected
      if (!selectedConversation && conversations.length > 0) {
        setSelectedConversation(conversations[0])
      }
    }
  }, [friends, selectedConversation])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return "Now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hour ago`
    return date.toLocaleDateString()
  }

  const [chatbotHistory, setChatbotHistory] = useState([
    {
      id: 1,
      sender: "AgriBot",
      content: "Hello! I'm your farming assistant. How can I help you today?",
      time: "Now",
      isOwn: false,
    },
  ])

  const sendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      // TODO: Send message via API
      toast({
        title: "Message sent!",
        description: `Your message to ${selectedConversation.name} has been sent.`,
      })
      setNewMessage("")
    }
  }

  const sendChatbotMessage = (message: string) => {
    const userMessage = {
      id: chatbotHistory.length + 1,
      sender: "You",
      content: message,
      time: "Now",
      isOwn: true,
    }

    const botResponse = {
      id: chatbotHistory.length + 2,
      sender: "AgriBot",
      content: getBotResponse(message),
      time: "Now",
      isOwn: false,
    }

    setChatbotHistory((prev) => [...prev, userMessage, botResponse])
    setChatbotMessage("")
  }

  const getBotResponse = (message: string) => {
    if (message.toLowerCase().includes("soil")) {
      return "For healthy soil, I recommend regular testing, adding organic compost, and rotating crops. Your current soil pH levels look good based on your IoT sensors!"
    }
    if (message.toLowerCase().includes("irrigation")) {
      return "Based on your olive trees and current weather forecast, I suggest maintaining your current schedule but reducing duration by 10% due to expected rain."
    }
    if (message.toLowerCase().includes("pest")) {
      return "For organic pest control, neem oil and beneficial insects work well. I see you've had success with this method before! Would you like specific recipes?"
    }
    if (message.toLowerCase().includes("weather")) {
      return "This week shows rain tomorrow (85% chance), then sunny conditions. Perfect for your olive harvest planning!"
    }
    if (message.toLowerCase().includes("market") || message.toLowerCase().includes("price")) {
      return "Current olive oil prices in your region are 45-50 TND/L for premium quality. Your product quality ratings suggest you can command premium pricing!"
    }
    return "I'd be happy to help with that! Could you provide more specific details about what you'd like to know?"
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
          <p className="text-muted-foreground">Connect with farmers, buyers, and agricultural experts</p>
        </div>

        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="chatbot">AI Assistant</TabsTrigger>
            <TabsTrigger value="notifications">SMS Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
              {/* Conversations List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Conversations</CardTitle>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search conversations..." className="pl-10" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {friendsLoading ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Loading conversations...
                      </div>
                    ) : friendConversations.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <p>No friends to message yet.</p>
                        <p className="text-sm mt-1">Connect with farmers in the Community to start messaging!</p>
                      </div>
                    ) : (
                      friendConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedConversation?.id === conversation.id ? "bg-muted" : ""
                          }`}
                          onClick={() => setSelectedConversation(conversation)}
                        >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                              <AvatarFallback>
                                {conversation.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.online && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate">{conversation.name}</h4>
                              <span className="text-xs text-muted-foreground">{conversation.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                            <div className="flex items-center justify-between mt-1">
                              <Badge variant="outline" className="text-xs">
                                {conversation.type}
                              </Badge>
                              {conversation.unread > 0 && <Badge className="text-xs">{conversation.unread}</Badge>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Chat Area */}
              <Card className="lg:col-span-2 flex flex-col">
                {selectedConversation ? (
                  <>
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={selectedConversation.avatar || "/placeholder.svg"}
                              alt={selectedConversation.name}
                            />
                            <AvatarFallback>
                              {selectedConversation.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{selectedConversation.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {selectedConversation.online ? "Online" : "Offline"}
                              {selectedConversation.location && (
                                <span> • {selectedConversation.location.city || selectedConversation.location.governorate}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {currentMessages.map((message) => (
                      <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">{message.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <div className="border-t p-4">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1"
                    />
                    <Button size="sm" variant="outline">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={sendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                </>
                ) : (
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center text-muted-foreground">
                      <div className="mb-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                          <Send className="h-8 w-8" />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                      <p>Connect with farmers in the Community to start messaging!</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chatbot">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AgriBot Assistant
                  </CardTitle>
                  <CardDescription>Get instant help with farming questions and advice</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-96 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg">
                    {chatbotHistory.map((message) => (
                      <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-md px-4 py-2 rounded-lg ${
                            message.isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-background border text-foreground"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">{message.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Ask me anything about farming..."
                      value={chatbotMessage}
                      onChange={(e) => setChatbotMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendChatbotMessage(chatbotMessage)}
                    />
                    <Button onClick={() => sendChatbotMessage(chatbotMessage)}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Questions</CardTitle>
                  <CardDescription>Common farming topics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {chatbotSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-3 bg-transparent"
                      onClick={() => sendChatbotMessage(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    SMS Notifications
                  </CardTitle>
                  <CardDescription>Recent automated alerts sent to your phone</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {smsNotifications.map((notification) => (
                    <div key={notification.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{notification.title}</h4>
                        <Badge variant="outline">{notification.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>Configure when and how you receive alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weather Alerts</p>
                        <p className="text-sm text-muted-foreground">Rain, storms, temperature changes</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">IoT Sensor Alerts</p>
                        <p className="text-sm text-muted-foreground">Low battery, sensor offline, critical readings</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Task Reminders</p>
                        <p className="text-sm text-muted-foreground">Overdue tasks, upcoming deadlines</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketplace Updates</p>
                        <p className="text-sm text-muted-foreground">New inquiries, price changes</p>
                      </div>
                      <Badge variant="outline">Disabled</Badge>
                    </div>
                  </div>
                  <Button className="w-full">Update Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
