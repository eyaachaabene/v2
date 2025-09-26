# Backend API Implementation Guide

## Technology Stack Recommendations

### Core Backend
- **Node.js** with **Express.js** or **Fastify**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose ODM**
- **Redis** for caching and sessions

### Authentication & Security
- **JWT** for authentication
- **bcrypt** for password hashing
- **helmet** for security headers
- **rate-limiting** for API protection
- **CORS** configuration

### Real-time Features
- **Socket.io** for real-time notifications
- **WebSocket** for IoT data streaming
- **Server-Sent Events** for live updates

### File Storage
- **Cloudinary** or **AWS S3** for images
- **Multer** for file uploads
- **Sharp** for image processing

### External Integrations
- **OpenWeatherMap API** for weather data
- **SMS Gateway** (e.g., Twilio) for SMS notifications
- **Email Service** (e.g., SendGrid) for email notifications
- **Payment Gateway** for transactions

## Environment Variables

\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/agri-she
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# External APIs
OPENWEATHER_API_KEY=your-openweather-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
SENDGRID_API_KEY=your-sendgrid-key

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:3001/api

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
\`\`\`

## Folder Structure

\`\`\`
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── products.controller.ts
│   │   ├── orders.controller.ts
│   │   ├── iot.controller.ts
│   │   ├── irrigation.controller.ts
│   │   ├── opportunities.controller.ts
│   │   ├── learning.controller.ts
│   │   ├── tasks.controller.ts
│   │   ├── weather.controller.ts
│   │   ├── notifications.controller.ts
│   │   └── analytics.controller.ts
│   ├── models/
│   │   ├── User.model.ts
│   │   ├── Product.model.ts
│   │   ├── Order.model.ts
│   │   ├── IoTSensor.model.ts
│   │   ├── SensorReading.model.ts
│   │   ├── IrrigationSystem.model.ts
│   │   ├── IrrigationLog.model.ts
│   │   ├── Opportunity.model.ts
│   │   ├── LearningModule.model.ts
│   │   ├── UserProgress.model.ts
│   │   ├── Task.model.ts
│   │   ├── WeatherData.model.ts
│   │   ├── Notification.model.ts
│   │   ├── Review.model.ts
│   │   ├── Message.model.ts
│   │   └── Analytics.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── products.routes.ts
│   │   ├── orders.routes.ts
│   │   ├── iot.routes.ts
│   │   ├── irrigation.routes.ts
│   │   ├── opportunities.routes.ts
│   │   ├── learning.routes.ts
│   │   ├── tasks.routes.ts
│   │   ├── weather.routes.ts
│   │   ├── notifications.routes.ts
│   │   └── analytics.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── upload.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── error.middleware.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   ├── sms.service.ts
│   │   ├── weather.service.ts
│   │   ├── notification.service.ts
│   │   ├── iot.service.ts
│   │   ├── irrigation.service.ts
│   │   └── analytics.service.ts
│   ├── utils/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── logger.ts
│   │   ├── validation.ts
│   │   ├── helpers.ts
│   │   └── constants.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── product.types.ts
│   │   ├── iot.types.ts
│   │   └── common.types.ts
│   ├── jobs/
│   │   ├── weatherUpdate.job.ts
│   │   ├── sensorDataProcessing.job.ts
│   │   ├── irrigationScheduler.job.ts
│   │   └── notificationSender.job.ts
│   └── app.ts
├── tests/
├── docs/
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
\`\`\`

## Key Implementation Examples

### 1. User Authentication Controller

\`\`\`typescript
// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, role, profile } = req.body;
      
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user
      const user = new User({
        email,
        password: hashedPassword,
        role,
        profile,
        verification: {
          emailVerified: false,
          phoneVerified: false,
          identityVerified: false,
          farmVerified: role === 'farmer' ? false : undefined
        }
      });
      
      await user.save();
      
      // Generate tokens
      const tokens = AuthService.generateTokens(user._id);
      
      // Send verification email
      await AuthService.sendVerificationEmail(user);
      
      res.status(201).json({
        message: 'User registered successfully',
        user: AuthService.sanitizeUser(user),
        tokens
      });
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
  
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      // Generate tokens
      const tokens = AuthService.generateTokens(user._id);
      
      res.json({
        message: 'Login successful',
        user: AuthService.sanitizeUser(user),
        tokens
      });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  }
}
\`\`\`

### 2. IoT Data Processing Service

\`\`\`typescript
// src/services/iot.service.ts
import { IoTSensor } from '../models/IoTSensor.model';
import { SensorReading } from '../models/SensorReading.model';
import { IrrigationService } from './irrigation.service';
import { NotificationService } from './notification.service';

export class IoTService {
  static async processSensorReading(sensorId: string, data: any) {
    try {
      const sensor = await IoTSensor.findOne({ sensorId });
      if (!sensor) {
        throw new Error('Sensor not found');
      }
      
      // Create sensor reading
      const reading = new SensorReading({
        sensorId: sensor._id,
        farmerId: sensor.farmerId,
        readings: {
          value: data.value,
          unit: data.unit,
          quality: this.assessDataQuality(data.value, sensor.thresholds),
          batteryLevel: data.batteryLevel,
          signalStrength: data.signalStrength
        },
        timestamp: new Date()
      });
      
      // Check for alerts
      const alerts = this.checkThresholds(data.value, sensor.thresholds);
      if (alerts.length > 0) {
        reading.alerts = alerts;
        
        // Send notifications
        for (const alert of alerts) {
          await NotificationService.sendAlert(sensor.farmerId, alert);
        }
      }
      
      // Auto-irrigation trigger
      if (sensor.type === 'soil_moisture' && data.value < sensor.thresholds.min) {
        await IrrigationService.triggerAutoIrrigation(sensor.farmerId, sensor.location.fieldName);
      }
      
      await reading.save();
      
      // Update sensor status
      sensor.status = data.signalStrength > 50 ? 'Online' : 'Offline';
      await sensor.save();
      
      return reading;
    } catch (error) {
      console.error('Error processing sensor reading:', error);
      throw error;
    }
  }
  
  private static checkThresholds(value: number, thresholds: any) {
    const alerts = [];
    
    if (value < thresholds.min) {
      alerts.push({
        type: 'threshold_exceeded',
        severity: 'high',
        message: `Value ${value} is below minimum threshold ${thresholds.min}`,
        acknowledged: false
      });
    }
    
    if (value > thresholds.max) {
      alerts.push({
        type: 'threshold_exceeded',
        severity: 'high',
        message: `Value ${value} is above maximum threshold ${thresholds.max}`,
        acknowledged: false
      });
    }
    
    return alerts;
  }
  
  private static assessDataQuality(value: number, thresholds: any): string {
    if (value >= thresholds.optimal.min && value <= thresholds.optimal.max) {
      return 'Good';
    } else if (value >= thresholds.min && value <= thresholds.max) {
      return 'Fair';
    } else {
      return 'Poor';
    }
  }
}
\`\`\`

### 3. Real-time Notifications with Socket.io

\`\`\`typescript
// src/services/notification.service.ts
import { Server } from 'socket.io';
import { Notification } from '../models/Notification.model';
import { EmailService } from './email.service';
import { SMSService } from './sms.service';

export class NotificationService {
  private static io: Server;
  
  static setSocketIO(io: Server) {
    this.io = io;
  }
  
  static async sendNotification(userId: string, notification: any) {
    try {
      // Save to database
      const notificationDoc = new Notification({
        userId,
        ...notification,
        createdAt: new Date()
      });
      await notificationDoc.save();
      
      // Send real-time notification
      if (this.io) {
        this.io.to(`user_${userId}`).emit('notification', notification);
      }
      
      // Send via other channels based on user preferences
      const user = await User.findById(userId);
      if (user?.preferences.notifications.email) {
        await EmailService.sendNotificationEmail(user.email, notification);
      }
      
      if (user?.preferences.notifications.sms && notification.priority === 'Critical') {
        await SMSService.sendNotificationSMS(user.profile.phone, notification);
      }
      
      return notificationDoc;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
  
  static async sendAlert(userId: string, alert: any) {
    return this.sendNotification(userId, {
      type: 'Alert',
      category: 'Alert',
      title: 'Farm Alert',
      message: alert.message,
      priority: alert.severity === 'critical' ? 'Critical' : 'High',
      data: alert
    });
  }
}
\`\`\`

### 4. Automated Irrigation Controller

\`\`\`typescript
// src/controllers/irrigation.controller.ts
import { Request, Response } from 'express';
import { IrrigationSystem } from '../models/IrrigationSystem.model';
import { IrrigationService } from '../services/irrigation.service';

export class IrrigationController {
  static async getSystemStatus(req: Request, res: Response) {
    try {
      const { farmerId } = req.params;
      const systems = await IrrigationSystem.find({ farmerId });
      
      res.json({
        systems: systems.map(system => ({
          ...system.toObject(),
          currentStatus: IrrigationService.getSystemStatus(system)
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get irrigation status' });
    }
  }
  
  static async controlIrrigation(req: Request, res: Response) {
    try {
      const { systemId } = req.params;
      const { action, zones, duration } = req.body;
      
      const result = await IrrigationService.controlSystem(systemId, {
        action,
        zones,
        duration,
        triggeredBy: 'user'
      });
      
      res.json({
        message: 'Irrigation control executed successfully',
        result
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to control irrigation system' });
    }
  }
  
  static async getIrrigationLogs(req: Request, res: Response) {
    try {
      const { systemId } = req.params;
      const { startDate, endDate, limit = 50 } = req.query;
      
      const logs = await IrrigationService.getLogs(systemId, {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: parseInt(limit as string)
      });
      
      res.json({ logs });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get irrigation logs' });
    }
  }
}
\`\`\`

## Background Jobs with Node-Cron

\`\`\`typescript
// src/jobs/weatherUpdate.job.ts
import cron from 'node-cron';
import { WeatherService } from '../services/weather.service';

// Update weather data every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running weather update job...');
  try {
    await WeatherService.updateAllLocations();
    console.log('Weather update completed');
  } catch (error) {
    console.error('Weather update failed:', error);
  }
});

// src/jobs/irrigationScheduler.job.ts
import cron from 'node-cron';
import { IrrigationService } from '../services/irrigation.service';

// Check irrigation schedules every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Checking irrigation schedules...');
  try {
    await IrrigationService.processScheduledIrrigations();
    console.log('Irrigation schedule check completed');
  } catch (error) {
    console.error('Irrigation schedule check failed:', error);
  }
});
\`\`\`

This backend architecture provides a solid foundation for your Agri-SHE platform with proper separation of concerns, real-time capabilities, and scalable design patterns.
