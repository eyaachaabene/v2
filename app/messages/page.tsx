"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Phone, Video, Search, Plus, MoreVertical, Paperclip, Smile } from "lucide-react"
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
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [friendConversations, setFriendConversations] = useState<any[]>(conversations);
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    // For demo, just append to currentMessages (would be per-conversation in real app)
    currentMessages.push({
      id: currentMessages.length + 1,
      sender: "You",
      content: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    });
    setNewMessage("");
  };
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-foreground mb-4">Messages</h1>
        <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
          <div className="lg:col-span-1 bg-card rounded-lg shadow p-4 overflow-y-auto">
            <h2 className="font-semibold text-lg mb-4">Conversations</h2>
            {friendConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p>No friends to message yet.</p>
                <p className="text-sm mt-1">Connect with farmers in the Community to start messaging!</p>
              </div>
            ) : (
              friendConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedConversation?.id === conversation.id ? "bg-muted" : ""}`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-center gap-3">
                    <img src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} className="w-10 h-10 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate">{conversation.name}</h4>
                        <span className="text-xs text-muted-foreground">{conversation.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="lg:col-span-2 bg-card rounded-lg shadow flex flex-col">
            {selectedConversation ? (
              <>
                <div className="border-b p-4 flex items-center gap-3">
                  <img src={selectedConversation.avatar || "/placeholder.svg"} alt={selectedConversation.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <h3 className="font-semibold">{selectedConversation.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.online ? "Online" : "Offline"}
                      {selectedConversation.location && ` • ${selectedConversation.location.city || selectedConversation.location.governorate}`}
                    </p>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  {currentMessages.filter((message) => message.sender !== "AgriBot").map((message) => (
                    <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">{message.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1 border rounded px-3 py-2"
                    />
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded" onClick={sendMessage}>
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">💬</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                  <p>Connect with farmers in the Community to start messaging!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
