"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface AddOpportunityFormProps {
  onSuccess?: () => void
}

export function AddOpportunityForm({ onSuccess }: AddOpportunityFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    location: {
      governorate: "",
      city: "",
      address: ""
    },
    requirements: "",
    compensation: {
      type: "fixed",
      amount: "",
      currency: "TND"
    },
    duration: "",
    startDate: "",
    applicationDeadline: "",
    positions: "1",
    contactInfo: {
      phone: "",
      email: ""
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        toast.error("Please log in to create an opportunity")
        return
      }

      // Prepare the data
      const opportunityData = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(r => r.trim()),
        compensation: {
          ...formData.compensation,
          amount: parseFloat(formData.compensation.amount)
        },
        positions: {
          available: parseInt(formData.positions),
          filled: 0
        }
      }

      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(opportunityData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Opportunity created successfully!")
        setOpen(false)
        // Reset form
        setFormData({
          title: "",
          description: "",
          type: "",
          location: {
            governorate: "",
            city: "",
            address: ""
          },
          requirements: "",
          compensation: {
            type: "fixed",
            amount: "",
            currency: "TND"
          },
          duration: "",
          startDate: "",
          applicationDeadline: "",
          positions: "1",
          contactInfo: {
            phone: "",
            email: ""
          }
        })
        onSuccess?.()
      } else {
        toast.error(data.error || "Failed to create opportunity")
      }
    } catch (error) {
      console.error('Error creating opportunity:', error)
      toast.error("An error occurred while creating the opportunity")
    } finally {
      setLoading(false)
    }
  }

  const governorates = [
    "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte",
    "Béja", "Jendouba", "Kef", "Siliana", "Kairouan", "Kasserine", "Sidi Bouzid",
    "Sousse", "Monastir", "Mahdia", "Sfax", "Gafsa", "Tozeur", "Kebili",
    "Gabès", "Medenine", "Tataouine"
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Opportunity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Opportunity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Seasonal Harvest Workers Needed"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select opportunity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seasonal_work">Seasonal Work</SelectItem>
                <SelectItem value="part_time_job">Part-time Job</SelectItem>
                <SelectItem value="technical_work">Technical Work</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the opportunity in detail..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="governorate">Governorate *</Label>
              <Select 
                value={formData.location.governorate} 
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, governorate: value } 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select governorate" />
                </SelectTrigger>
                <SelectContent>
                  {governorates.map((gov) => (
                    <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.location.city}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, city: e.target.value } 
                })}
                placeholder="City"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.location.address}
              onChange={(e) => setFormData({ 
                ...formData, 
                location: { ...formData.location, address: e.target.value } 
              })}
              placeholder="Detailed address (optional)"
            />
          </div>

          <div>
            <Label htmlFor="requirements">Requirements (one per line)</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="- Experience in agriculture&#10;- Physical fitness&#10;- Availability during harvest season"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="compensationType">Compensation Type</Label>
              <Select 
                value={formData.compensation.type} 
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  compensation: { ...formData.compensation, type: value } 
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="negotiable">Negotiable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.compensation.amount}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  compensation: { ...formData.compensation, amount: e.target.value } 
                })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="positions">Positions *</Label>
              <Input
                id="positions"
                type="number"
                value={formData.positions}
                onChange={(e) => setFormData({ ...formData, positions: e.target.value })}
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="deadline">Application Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g., 2 months, 3 weeks"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.contactInfo.phone}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contactInfo: { ...formData.contactInfo, phone: e.target.value } 
                })}
                placeholder="+216 XX XXX XXX"
              />
            </div>
            <div>
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contactInfo: { ...formData.contactInfo, email: e.target.value } 
                })}
                placeholder="contact@example.com"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Opportunity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
