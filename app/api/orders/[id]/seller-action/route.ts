import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate order ID
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const { action } = await request.json()
    if (!action || !['confirm', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'confirm' or 'reject'" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Find the order
    const order = await db.collection("orders").findOne({
      _id: new ObjectId(params.id)
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if the user is the seller of any items in this order
    const userItems = order.items.filter((item: any) => 
      (item.supplierId && item.supplierId.toString() === userId) ||
      (item.farmerId && item.farmerId.toString() === userId)
    )

    if (userItems.length === 0) {
      return NextResponse.json(
        { error: "You are not authorized to manage this order" },
        { status: 403 }
      )
    }

    // Update order status based on action
    let newStatus: string
    let notificationMessage: string

    if (action === 'confirm') {
      newStatus = 'confirmed'
      notificationMessage = 'Your order has been confirmed by the seller'
    } else {
      newStatus = 'cancelled'
      notificationMessage = 'Your order has been cancelled by the seller'
    }

    // Update the order status
    const updateResult = await db.collection("orders").updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          status: newStatus,
          updatedAt: new Date(),
          sellerAction: {
            action,
            sellerId: new ObjectId(userId),
            actionDate: new Date()
          }
        }
      }
    )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Create notification for the buyer
    await db.collection("notifications").insertOne({
      userId: order.userId,
      type: action === 'confirm' ? 'order_confirmed' : 'order_cancelled',
      title: action === 'confirm' ? 'Order Confirmed' : 'Order Cancelled',
      message: notificationMessage,
      orderId: new ObjectId(params.id),
      read: false,
      createdAt: new Date()
    })

    // If confirmed, update product/resource quantities (if not already done)
    if (action === 'confirm') {
      for (const item of userItems) {
        if (item.type === 'product') {
          await db.collection("products").updateOne(
            { _id: new ObjectId(item.id) },
            { $inc: { quantity: -item.quantity } }
          )
        } else if (item.type === 'resource') {
          await db.collection("resources").updateOne(
            { _id: new ObjectId(item.id) },
            { $inc: { "availability.quantity": -item.quantity } }
          )
        }
      }
    } else {
      // If rejected, restore product/resource quantities
      for (const item of userItems) {
        if (item.type === 'product') {
          await db.collection("products").updateOne(
            { _id: new ObjectId(item.id) },
            { $inc: { quantity: item.quantity } }
          )
        } else if (item.type === 'resource') {
          await db.collection("resources").updateOne(
            { _id: new ObjectId(item.id) },
            { $inc: { "availability.quantity": item.quantity } }
          )
        }
      }
    }

    return NextResponse.json({
      message: `Order ${action}ed successfully`,
      order: {
        ...order,
        status: newStatus
      }
    })

  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}