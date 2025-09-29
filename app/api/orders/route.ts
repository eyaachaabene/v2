import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

interface OrderItem {
  id: string
  name: string
  description: string
  price: number
  currency: string
  unit: string
  quantity: number
  image?: string
  category: string
  type: 'product' | 'resource'
  supplierId?: string
  farmerId?: string
  minimumOrder?: number
  maxQuantity?: number
}

interface CreateOrderRequest {
  items: OrderItem[]
  total: number
  shippingAddress?: {
    fullName: string
    address: string
    city: string
    governorate: string
    phone: string
  }
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const body: CreateOrderRequest = await request.json()
    const { items, total, shippingAddress, notes } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Validate items and check availability
    for (const item of items) {
      if (item.type === 'product') {
        const product = await db.collection("products").findOne({ _id: new ObjectId(item.id) })
        if (!product) {
          return NextResponse.json(
            { error: `Product ${item.name} not found` },
            { status: 400 }
          )
        }
        if (product.availability.quantity < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient quantity for ${item.name}` },
            { status: 400 }
          )
        }
      } else if (item.type === 'resource') {
        const resource = await db.collection("resources").findOne({ _id: new ObjectId(item.id) })
        if (!resource) {
          return NextResponse.json(
            { error: `Resource ${item.name} not found` },
            { status: 400 }
          )
        }
        if (resource.availability.quantity < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient quantity for ${item.name}` },
            { status: 400 }
          )
        }
        if (item.minimumOrder && item.quantity < item.minimumOrder) {
          return NextResponse.json(
            { error: `Minimum order quantity for ${item.name} is ${item.minimumOrder}` },
            { status: 400 }
          )
        }
      }
    }

    // Create order
    const orderData = {
      userId: new ObjectId(userId),
      items: items.map(item => ({
        ...item,
        productId: item.type === 'product' ? new ObjectId(item.id) : undefined,
        resourceId: item.type === 'resource' ? new ObjectId(item.id) : undefined,
        supplierId: item.supplierId ? new ObjectId(item.supplierId) : undefined,
        farmerId: item.farmerId ? new ObjectId(item.farmerId) : undefined
      })),
      total,
      shippingAddress,
      notes,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection("orders").insertOne(orderData)

    // Update product/resource quantities
    for (const item of items) {
      if (item.type === 'product') {
        await db.collection("products").updateOne(
          { _id: new ObjectId(item.id) },
          { $inc: { "availability.quantity": -item.quantity } }
        )
      } else if (item.type === 'resource') {
        await db.collection("resources").updateOne(
          { _id: new ObjectId(item.id) },
          { $inc: { "availability.quantity": -item.quantity } }
        )
      }
    }

    // Create notifications for suppliers/farmers
    const notifications = []
    const supplierIds = new Set()
    const farmerIds = new Set()

    items.forEach(item => {
      if (item.supplierId) supplierIds.add(item.supplierId)
      if (item.farmerId) farmerIds.add(item.farmerId)
    })

    // Notify suppliers
    for (const supplierId of supplierIds) {
      notifications.push({
        userId: new ObjectId(supplierId as string),
        type: 'new_order',
        title: 'New Order Received',
        message: `You have received a new order from a customer`,
        orderId: result.insertedId,
        read: false,
        createdAt: new Date()
      })
    }

    // Notify farmers
    for (const farmerId of farmerIds) {
      notifications.push({
        userId: new ObjectId(farmerId as string),
        type: 'new_order',
        title: 'New Order Received',
        message: `You have received a new order for your products`,
        orderId: result.insertedId,
        read: false,
        createdAt: new Date()
      })
    }

    if (notifications.length > 0) {
      await db.collection("notifications").insertMany(notifications)
    }

    return NextResponse.json({
      orderId: result.insertedId,
      message: "Order created successfully"
    })

  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const { db } = await connectToDatabase()

    // Get user's orders
    const orders = await db.collection("orders")
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray()

    // Populate seller information for each order
    const ordersWithSellers = await Promise.all(
      orders.map(async (order) => {
        // Group items by seller
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
        // In a more complex system, you might want to split orders by seller
        const sellers = Array.from(sellerMap.values())
        const mainSeller = sellers.length > 0 ? sellers[0] : null
        
        return {
          ...order,
          seller: mainSeller,
          sellers: sellers // Keep all sellers for more detailed view
        }
      })
    )

    return NextResponse.json({
      orders: ordersWithSellers
    })

  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}