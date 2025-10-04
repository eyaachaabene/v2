import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const { recipientId, subject, message } = await request.json()

    if (!recipientId || !message) {
      return NextResponse.json({ 
        error: 'Recipient ID and message are required' 
      }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('farmers_marketplace')

    // Vérifier que le destinataire existe
    const recipient = await db.collection('users').findOne({
      _id: new ObjectId(recipientId)
    })

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    // Créer le message
    const messageData = {
      senderId: new ObjectId(decoded.userId),
      recipientId: new ObjectId(recipientId),
      subject: subject || 'New Message',
      message: message.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await db.collection('messages').insertOne(messageData)

    return NextResponse.json({
      message: 'Message sent successfully',
      messageId: result.insertedId
    })

  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const client = await clientPromise
    const db = client.db('farmers_marketplace')

    // Récupérer les messages de l'utilisateur (envoyés et reçus)
    const messages = await db.collection('messages').aggregate([
      {
        $match: {
          $or: [
            { senderId: new ObjectId(decoded.userId) },
            { recipientId: new ObjectId(decoded.userId) }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'senderId',
          foreignField: '_id',
          as: 'sender'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'recipientId',
          foreignField: '_id',
          as: 'recipient'
        }
      },
      {
        $addFields: {
          sender: { $arrayElemAt: ['$sender', 0] },
          recipient: { $arrayElemAt: ['$recipient', 0] }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray()

    return NextResponse.json({ messages })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}