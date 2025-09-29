import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET /api/orders/[id] - Fetching order:', params.id)

    // Get authorization token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No auth token provided')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let userId: string

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      userId = decoded.userId
      console.log('Authenticated user:', userId)
    } catch (error) {
      console.log('Invalid token:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Validate order ID
    if (!ObjectId.isValid(params.id)) {
      console.log('Invalid order ID format:', params.id)
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()
    console.log('Connected to database')

    // Find the order
    const order = await db.collection('orders').findOne({
      _id: new ObjectId(params.id)
    })

    if (!order) {
      console.log('Order not found:', params.id)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if user owns this order
    if (order.userId.toString() !== userId) {
      console.log('User does not own this order. Order userId:', order.userId, 'Request userId:', userId)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('Order found and authorized:', order._id)

    // Populate seller information
    const sellerMap = new Map()
    
    for (const item of order.items) {
      let sellerId = null
      if (item.supplierId) {
        sellerId = item.supplierId.toString()
      } else if (item.farmerId) {
        sellerId = item.farmerId.toString()
      }
      
      if (sellerId && !sellerMap.has(sellerId)) {
        const seller = await db.collection("users").findOne(
          { _id: new ObjectId(sellerId) },
          { projection: { firstName: 1, lastName: 1, name: 1, avatar: 1, email: 1 } }
        )
        if (seller) {
          sellerMap.set(sellerId, seller)
        }
      }
    }
    
    // For now, we'll use the first seller as the main seller
    const sellers = Array.from(sellerMap.values())
    const mainSeller = sellers.length > 0 ? sellers[0] : null

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        _id: order._id.toString(),
        seller: mainSeller,
        sellers: sellers
      }
    })

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PATCH /api/orders/[id] - Updating order:', params.id)

    // Get authorization token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No auth token provided')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let userId: string

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      userId = decoded.userId
      console.log('Authenticated user:', userId)
    } catch (error) {
      console.log('Invalid token:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Validate order ID
    if (!ObjectId.isValid(params.id)) {
      console.log('Invalid order ID format:', params.id)
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    // Parse request body
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()
    console.log('Connected to database')

    // Find the order first to check ownership
    const existingOrder = await db.collection('orders').findOne({
      _id: new ObjectId(params.id)
    })

    if (!existingOrder) {
      console.log('Order not found:', params.id)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if user owns this order
    if (existingOrder.userId.toString() !== userId) {
      console.log('User does not own this order. Order userId:', existingOrder.userId, 'Request userId:', userId)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only allow certain status changes for users
    // Users can only cancel pending orders
    if (status === 'cancelled' && existingOrder.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Can only cancel pending orders' 
      }, { status: 400 })
    }

    // Update the order
    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          status,
          updatedAt: new Date().toISOString()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    console.log('Order updated successfully:', params.id)

    // Get updated order
    const updatedOrder = await db.collection('orders').findOne({
      _id: new ObjectId(params.id)
    })

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: {
        ...updatedOrder,
        _id: updatedOrder?._id.toString()
      }
    })

  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}