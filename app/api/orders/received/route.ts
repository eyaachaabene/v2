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
  supplierId?: ObjectId
  farmerId?: ObjectId
  minimumOrder?: number
  maxQuantity?: number
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

    // Get orders that contain items from this user (supplier/farmer)
    const orders = await db.collection("orders")
      .find({
        $or: [
          { "items.supplierId": new ObjectId(userId) },
          { "items.farmerId": new ObjectId(userId) }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Populate buyer information for each order
    const ordersWithBuyers = await Promise.all(
      orders.map(async (order) => {
        // Get buyer information
        const buyer = await db.collection("users").findOne(
          { _id: order.userId },
          { projection: { firstName: 1, lastName: 1, name: 1, avatar: 1, email: 1, phone: 1 } }
        )

        // Filter items to only show items from this seller
        const myItems = order.items.filter((item: any) => 
          (item.supplierId && item.supplierId.toString() === userId) ||
          (item.farmerId && item.farmerId.toString() === userId)
        )

        // Calculate total for seller's items only
        const myTotal = myItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)

        return {
          ...order,
          buyer,
          items: myItems,
          sellerTotal: myTotal
        }
      })
    )

    return NextResponse.json({
      orders: ordersWithBuyers
    })

  } catch (error) {
    console.error("Error fetching received orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch received orders" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    const { orderId, action, reason } = await request.json()

    if (!orderId || !action) {
      return NextResponse.json(
        { error: "Order ID and action are required" },
        { status: 400 }
      )
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'accept' or 'reject'" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Find the order and verify the user owns items in it
    const order = await db.collection("orders").findOne({
      _id: new ObjectId(orderId),
      $or: [
        { "items.supplierId": new ObjectId(userId) },
        { "items.farmerId": new ObjectId(userId) }
      ]
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or you don't have permission to modify it" },
        { status: 404 }
      )
    }

    // Update order status based on action
    const newStatus = action === 'accept' ? 'confirmed' : 'cancelled'
    
    await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          status: newStatus,
          sellerResponse: {
            action: action,
            reason: reason || null,
            respondedAt: new Date(),
            respondedBy: new ObjectId(userId)
          },
          updatedAt: new Date()
        }
      }
    )

    // If rejected, restore product/resource quantities
    if (action === 'reject') {
      for (const item of order.items) {
        // Only restore quantities for items belonging to this seller
        const belongsToSeller = (item.supplierId && item.supplierId.toString() === userId) ||
                               (item.farmerId && item.farmerId.toString() === userId)
        
        if (belongsToSeller) {
          if (item.type === 'product') {
            await db.collection("products").updateOne(
              { _id: new ObjectId(item.id) },
              { $inc: { "inventory.quantity": item.quantity } }
            )
          } else if (item.type === 'resource') {
            await db.collection("resources").updateOne(
              { _id: new ObjectId(item.id) },
              { $inc: { "availability.quantity": item.quantity } }
            )
          }
        }
      }
    }

    // Create notification for buyer
    await db.collection("notifications").insertOne({
      userId: order.userId,
      type: action === 'accept' ? 'order_accepted' : 'order_rejected',
      title: action === 'accept' ? 'Order Accepted' : 'Order Rejected',
      message: action === 'accept' 
        ? `Your order has been accepted by the seller`
        : `Your order has been rejected by the seller${reason ? `: ${reason}` : ''}`,
      orderId: new ObjectId(orderId),
      read: false,
      createdAt: new Date()
    })

    return NextResponse.json({
      message: `Order ${action}ed successfully`
    })

  } catch (error) {
    console.error("Error processing order:", error)
    return NextResponse.json(
      { error: "Failed to process order" },
      { status: 500 }
    )
  }
}