# Admin Notifications System - Integration Guide

## ✅ **Working Notifications** (Auto-Triggered)

These notifications are **fully functional** and will automatically appear when the corresponding events occur:

### 1. **New Orders**
- **Trigger**: When a customer completes checkout via Stripe
- **Location**: `app/api/webhook/stripe/route.ts`
- **Priority**: High
- **Test**: Make a test purchase through the checkout flow

### 2. **High-Value Orders** (>$2,000)
- **Trigger**: When an order total exceeds $2,000
- **Location**: `app/api/webhook/stripe/route.ts`
- **Priority**: High
- **Test**: Make a purchase with items totaling over $2,000

### 3. **New Customer Registrations**
- **Trigger**: When a user creates a new account
- **Location**: `app/api/register/route.ts`
- **Priority**: Medium
- **Test**: Register a new account via `/register` page

### 4. **Payment Failures**
- **Trigger**: Currently placeholder - needs Stripe webhook integration
- **Status**: ⚠️ Requires additional Stripe webhook event handling
- **See**: Integration section below

---

## 🔌 **Placeholder Notifications** (Require External Integrations)

These notification functions exist but need external services/features to be implemented:

### 5. **Shipping Updates**
**What you need:**
- A shipping provider integration (e.g., ShipStation, EasyPost, or Shippo)
- Webhook endpoint to receive shipping status updates
- Order tracking number storage

**How to implement:**
```typescript
// Example: When you receive a shipping webhook
import { NotificationHelpers } from "@/lib/notifications";

await NotificationHelpers.shippingUpdate(
  orderId,
  "Shipped", // or "In Transit", "Delivered", etc.
  trackingNumber
);
```

**Recommended Services:**
- **ShipStation**: https://www.shipstation.com/
- **EasyPost**: https://www.easypost.com/
- **Shippo**: https://goshippo.com/

---

### 6. **Low Stock Alerts**
**What you need:**
- Inventory tracking system in your database
- Product stock/quantity field in MongoDB
- Automated check when orders are placed

**How to implement:**
```typescript
// Add to your order processing logic
const product = await db.collection("Product").findOne({ _id: productId });

if (product.stock <= product.lowStockThreshold) {
  await NotificationHelpers.lowStock(
    product._id.toString(),
    product.name,
    product.stock
  );
}
```

**Database Schema Addition:**
```typescript
// Add to Product collection:
{
  stock: Number,          // Current quantity
  lowStockThreshold: Number  // Alert when stock <= this value (e.g., 5)
}
```

---

### 7. **Abandoned Carts**
**What you need:**
- Cart persistence (save carts to database)
- Background job/cron to check for abandoned carts
- Time threshold (e.g., 24 hours of inactivity)

**How to implement:**
```typescript
// Create a cron job (using Vercel Cron or similar)
// app/api/cron/check-abandoned-carts/route.ts

export async function GET(req: Request) {
  const abandonedCarts = await db.collection("Cart").find({
    updatedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    items: { $exists: true, $ne: [] }
  }).toArray();

  for (const cart of abandonedCarts) {
    const cartValue = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    await NotificationHelpers.abandonedCart(
      cart.userEmail,
      cartValue
    );
  }
}
```

**Recommended Services:**
- **Vercel Cron Jobs**: https://vercel.com/docs/cron-jobs
- **Upstash QStash**: https://upstash.com/

---

### 8. **Customer Support Inquiries**
**What you need:**
- Contact form or support ticket system
- Email integration or form submission endpoint

**How to implement:**
```typescript
// app/api/contact/route.ts
import { NotificationHelpers } from "@/lib/notifications";

export async function POST(req: Request) {
  const { email, subject, message } = await req.json();
  
  // Save to database
  await db.collection("SupportTicket").insertOne({
    email,
    subject,
    message,
    createdAt: new Date()
  });
  
  // Create notification
  await NotificationHelpers.supportInquiry(email, subject);
  
  return NextResponse.json({ success: true });
}
```

---

## 📊 **Notification System Architecture**

### Database Collection: `Notification`
```typescript
{
  _id: ObjectId,
  type: "new_order" | "high_value_order" | "new_customer" | "payment_failed" | "shipping_update" | "low_stock" | "abandoned_cart" | "support_inquiry",
  title: String,
  message: String,
  metadata: Object,  // Additional data (orderId, customerEmail, etc.)
  priority: "low" | "medium" | "high",
  read: Boolean,
  createdAt: Date
}
```

### API Endpoints
- **GET** `/api/admin/notifications` - Fetch all notifications
- **PATCH** `/api/admin/notifications` - Mark as read (single or all)
- **DELETE** `/api/admin/notifications` - Clear read notifications

### Helper Functions
Located in `lib/notifications.ts`:
- `NotificationHelpers.newOrder()`
- `NotificationHelpers.highValueOrder()`
- `NotificationHelpers.newCustomer()`
- `NotificationHelpers.paymentFailed()`
- `NotificationHelpers.shippingUpdate()` ⚠️ Placeholder
- `NotificationHelpers.lowStock()` ⚠️ Placeholder
- `NotificationHelpers.abandonedCart()` ⚠️ Placeholder
- `NotificationHelpers.supportInquiry()` ⚠️ Placeholder

---

## 🚀 **Next Steps**

1. **Test Working Notifications**: Make a test order and register a new account
2. **Choose Integrations**: Decide which placeholder features you want to implement
3. **Set Up External Services**: Sign up for shipping providers, cron job services, etc.
4. **Implement Webhooks**: Add webhook endpoints for external services
5. **Monitor**: Check the notifications panel regularly for alerts

---

## 💡 **Tips**

- **Priority Levels**: Use "high" for urgent actions (orders, payments), "medium" for important but not urgent (new customers), and "low" for informational (shipping updates)
- **Metadata**: Store relevant IDs and data in the `metadata` field for future reference
- **Cleanup**: Run periodic cleanup jobs to delete old read notifications
- **Real-time Updates**: Consider adding WebSocket support for live notification updates without page refresh

---

**Questions?** Check the code in:
- `lib/notifications.ts` - Helper functions
- `app/api/admin/notifications/route.ts` - API endpoints
- `app/admin/(dashboard)/notifications/page.tsx` - UI component
