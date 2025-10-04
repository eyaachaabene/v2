# 🌾 Agri-SHE Opportunities Marketplace

## Overview

A fully dynamic agricultural opportunities marketplace where farmers can post job opportunities and workers can apply. The platform features real-time data, user interactions, and automated notifications.

## ✨ Features

### For Employers (Farmers/Organizations)
- ✅ **Post Opportunities** - Create job postings with detailed requirements
- ✅ **Manage Applications** - Review, accept, or reject applications
- ✅ **Dashboard Analytics** - View application statistics and metrics
- ✅ **Email Notifications** - Automatic alerts when someone applies
- ✅ **Application Management** - Track all applicants in one place

### For Workers
- ✅ **Browse Opportunities** - Search and filter available jobs
- ✅ **Apply with Details** - Submit applications with cover letter and resume
- ✅ **Track Applications** - Monitor application status
- ✅ **Save Opportunities** - Bookmark interesting jobs for later
- ✅ **Get Notifications** - Receive updates on application status

### Platform Features
- 🔍 **Advanced Search** - Filter by location, job type, urgency, keywords
- 📍 **Location-based** - Find opportunities near you
- ⚡ **Real-time Updates** - Live application counts and notifications
- 📧 **Email Integration** - Automated email notifications
- 🔐 **Secure** - Authentication and authorization checks
- 📱 **Responsive** - Works on all devices

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd v2
npm install
# or
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/agrishe
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: For email notifications
SENDGRID_API_KEY=your-sendgrid-key
EMAIL_FROM=noreply@agrishe.com
```

### 3. Initialize Database with Sample Data

```bash
node scripts/initialize-opportunities.js
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000/opportunities](http://localhost:3000/opportunities)

## 📖 API Documentation

### Opportunities API

#### List Opportunities
```http
GET /api/opportunities?page=1&limit=10&type=seasonal_work&location=Sfax&search=harvest
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `type` - Job type filter (seasonal_work, full_time, etc.)
- `location` - Governorate filter
- `urgency` - Urgency level (urgent, normal, low_priority)
- `search` - Search in title, description, skills

**Response:**
```json
{
  "opportunities": [...],
  "locations": ["Sfax", "Tunis", "Bizerte"],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### Create Opportunity
```http
POST /api/opportunities
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Help with Olive Harvest",
  "description": "Looking for workers...",
  "type": "seasonal_work",
  "jobType": "Seasonal Work",
  "urgency": "urgent",
  "location": {
    "governorate": "Sfax",
    "city": "Sfax"
  },
  "compensation": {
    "type": "daily",
    "amount": 25,
    "currency": "TND"
  },
  "duration": {
    "type": "weeks",
    "value": 3
  },
  "positions": {
    "available": 10
  },
  "requirements": {
    "skills": ["Harvesting", "Physical Work"]
  }
}
```

#### Apply to Opportunity
```http
POST /api/opportunities/{id}/apply
Content-Type: application/json
Authorization: Bearer <token>

{
  "coverLetter": "I am interested...",
  "relevantExperience": "I have 2 years...",
  "availability": {
    "startDate": "2025-11-01",
    "description": "Available full-time"
  },
  "resumeUrl": "https://..."
}
```

#### Get Applications (Employer)
```http
GET /api/opportunities/{id}/applications
Authorization: Bearer <token>
```

#### Update Application Status
```http
PATCH /api/opportunities/{id}/applications/{applicationId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "accepted",
  "notes": "Great candidate!"
}
```

### Dashboard APIs

#### Employer Dashboard
```http
GET /api/dashboard/employer/opportunities?status=active
Authorization: Bearer <token>
```

#### Worker Dashboard
```http
GET /api/dashboard/worker/applications?status=pending
Authorization: Bearer <token>
```

### Saved Opportunities

#### Save Opportunity
```http
POST /api/opportunities/saved
Content-Type: application/json
Authorization: Bearer <token>

{
  "opportunityId": "...",
  "notes": "Interesting opportunity"
}
```

#### Get Saved Opportunities
```http
GET /api/opportunities/saved
Authorization: Bearer <token>
```

## 🎨 UI Components

### Post Opportunity Form

```tsx
import { PostOpportunityForm } from "@/components/post-opportunity-form"

<PostOpportunityForm 
  onSuccess={() => router.push('/dashboard')}
  onCancel={() => router.back()}
/>
```

### Opportunity Card

```tsx
import { OpportunityCard } from "@/components/opportunity-card"

<OpportunityCard 
  opportunity={opportunity}
  onApplySuccess={() => refetch()}
/>
```

### Apply Modal

```tsx
import { ApplyOpportunityModal } from "@/components/apply-opportunity-modal"

<ApplyOpportunityModal
  open={isOpen}
  onOpenChange={setIsOpen}
  opportunity={opportunity}
  onSuccess={() => console.log('Applied!')}
/>
```

## 🪝 React Hooks

### useOpportunities

```tsx
import { useOpportunities } from "@/hooks/use-opportunities"

const { 
  opportunities, 
  locations,
  pagination,
  loading, 
  error,
  refetch 
} = useOpportunities({
  type: "seasonal_work",
  location: "Sfax",
  search: "harvest",
  page: 1,
  limit: 10
})
```

### useOpportunity

```tsx
import { useOpportunity } from "@/hooks/use-opportunities"

const { 
  opportunity, 
  loading, 
  error,
  refetch 
} = useOpportunity(opportunityId)
```

### useApplyToOpportunity

```tsx
import { useApplyToOpportunity } from "@/hooks/use-opportunities"

const { apply, loading, error, success } = useApplyToOpportunity()

await apply(opportunityId, {
  coverLetter: "...",
  relevantExperience: "...",
  availability: { ... }
})
```

### useApplicationStatus

```tsx
import { useApplicationStatus } from "@/hooks/use-opportunities"

const { 
  applied, 
  application, 
  loading,
  refetch 
} = useApplicationStatus(opportunityId)
```

### useSaveOpportunity

```tsx
import { useSaveOpportunity } from "@/hooks/use-opportunities"

const { save, remove, loading, error } = useSaveOpportunity()

await save(opportunityId, "Interesting job")
await remove(opportunityId)
```

## 🗄️ Database Schema

### Opportunities Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  type: String, // seasonal_work, full_time, part_time, etc.
  jobType: String,
  urgency: String, // urgent, normal, low_priority
  postedBy: ObjectId, // User ID
  postedByName: String,
  postedByType: String, // farmer, ngo, partner
  location: {
    governorate: String,
    city: String,
    address: String,
    coordinates: { latitude: Number, longitude: Number }
  },
  compensation: {
    type: String,
    amount: Number,
    currency: String,
    payRate: String,
    benefits: [String]
  },
  duration: {
    type: String,
    value: Number,
    description: String
  },
  positions: {
    available: Number,
    filled: Number
  },
  requirements: {
    skills: [String],
    experienceLevel: String,
    experienceYears: Number,
    education: String
  },
  contactInfo: {
    name: String,
    email: String,
    phone: String
  },
  startDate: Date,
  endDate: Date,
  applicationDeadline: Date,
  maxApplicants: Number,
  currentApplicants: Number,
  applicantIds: [ObjectId],
  viewCount: Number,
  saveCount: Number,
  status: String, // active, filled, expired, closed
  featured: Boolean,
  urgent: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Applications Collection

```javascript
{
  _id: ObjectId,
  opportunityId: ObjectId,
  opportunityTitle: String,
  applicantId: ObjectId,
  applicantName: String,
  applicantEmail: String,
  applicantPhone: String,
  status: String, // pending, reviewed, accepted, rejected
  coverLetter: String,
  relevantExperience: String,
  availability: {
    startDate: Date,
    endDate: Date,
    description: String
  },
  resumeUrl: String,
  appliedAt: Date,
  reviewedAt: Date,
  reviewedBy: ObjectId,
  reviewNotes: String,
  notificationSent: Boolean,
  emailSent: Boolean
}
```

## 📧 Email Notifications

Email notifications are automatically sent for:

1. **New Application** - Employer receives email when someone applies
2. **Application Accepted** - Applicant receives congratulations email
3. **Application Reviewed** - Applicant notified of status change

### Configure Email Service

In `lib/services/email-service.ts`, integrate with your preferred provider:

**SendGrid:**
```typescript
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

await sgMail.send({
  to: data.to,
  from: process.env.EMAIL_FROM!,
  subject: data.subject,
  html: data.html
})
```

**NodeMailer:**
```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

await transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: data.to,
  subject: data.subject,
  html: data.html
})
```

## 🔒 Security

### Implemented
- ✅ JWT authentication on protected routes
- ✅ Authorization checks (ownership verification)
- ✅ Input validation
- ✅ Duplicate prevention
- ✅ ObjectId validation
- ✅ Status validation

### Recommended Additions
- [ ] Rate limiting (use `express-rate-limit`)
- [ ] Input sanitization (use `DOMPurify`)
- [ ] CORS configuration
- [ ] Helmet.js for security headers
- [ ] File upload validation
- [ ] SQL injection prevention (using MongoDB properly)

## 📊 Performance Optimization

### Database Indexes

Create these indexes for optimal performance:

```javascript
// In MongoDB shell or via script
db.opportunities.createIndex({ 
  status: 1, 
  featured: -1, 
  urgent: -1, 
  createdAt: -1 
})

db.opportunities.createIndex({ "location.governorate": 1 })
db.opportunities.createIndex({ type: 1 })
db.opportunities.createIndex({ postedBy: 1 })
db.opportunities.createIndex({ 
  title: "text", 
  description: "text", 
  "requirements.skills": "text" 
})

db.opportunity_applications.createIndex({ 
  opportunityId: 1, 
  applicantId: 1 
}, { unique: true })

db.opportunity_applications.createIndex({ applicantId: 1, status: 1 })
```

## 🧪 Testing

### Test the APIs

```bash
# Get opportunities
curl http://localhost:3000/api/opportunities

# Create opportunity (requires auth token)
curl -X POST http://localhost:3000/api/opportunities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Opportunity",
    "description": "Test description",
    "type": "seasonal_work",
    ...
  }'
```

## 📝 Next Steps

1. **File Upload** - Implement resume/CV upload with AWS S3 or Cloudinary
2. **Real-time Features** - Add WebSocket for live updates
3. **SMS Notifications** - Integrate Twilio for SMS alerts
4. **Analytics Dashboard** - Track conversion rates and metrics
5. **Matching Algorithm** - Recommend opportunities based on user profile
6. **Chat System** - Direct messaging between employer and applicant
7. **Rating System** - Allow ratings and reviews
8. **Report System** - Flag inappropriate content

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is part of the Agri-SHE platform.

## 📞 Support

For questions or issues, please contact the development team.

---

Built with ❤️ for empowering agricultural communities
