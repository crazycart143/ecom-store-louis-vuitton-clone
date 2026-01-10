import clientPromise from "./mongodb";

export type NotificationType =
    | "new_order"
    | "high_value_order"
    | "new_customer"
    | "payment_failed"
    | "shipping_update"
    | "low_stock"
    | "abandoned_cart"
    | "support_inquiry";

export interface CreateNotificationParams {
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
    priority?: "low" | "medium" | "high";
}

/**
 * Creates a new admin notification in the database
 */
export async function createNotification(params: CreateNotificationParams) {
    try {
        const client = await clientPromise;
        const db = client.db();

        const notification = {
            type: params.type,
            title: params.title,
            message: params.message,
            metadata: params.metadata || {},
            priority: params.priority || "medium",
            read: false,
            createdAt: new Date(),
        };

        const result = await db.collection("Notification").insertOne(notification);

        console.log(`[Notification] Created: ${params.type} - ${params.title}`);
        return result.insertedId;
    } catch (error) {
        console.error("[Notification] Failed to create:", error);
        return null;
    }
}

/**
 * Helper functions for common notification types
 */
export const NotificationHelpers = {
    newOrder: async (orderId: string, customerEmail: string, total: number) => {
        return createNotification({
            type: "new_order",
            title: "New Order Received",
            message: `Order from ${customerEmail} - $${total.toFixed(2)}`,
            metadata: { orderId, customerEmail, total },
            priority: "high",
        });
    },

    highValueOrder: async (orderId: string, customerEmail: string, total: number) => {
        return createNotification({
            type: "high_value_order",
            title: "High-Value Order Alert",
            message: `Premium order from ${customerEmail} - $${total.toFixed(2)}`,
            metadata: { orderId, customerEmail, total },
            priority: "high",
        });
    },

    newCustomer: async (customerEmail: string, customerId: string) => {
        return createNotification({
            type: "new_customer",
            title: "New Customer Registration",
            message: `${customerEmail} just created an account`,
            metadata: { customerEmail, customerId },
            priority: "medium",
        });
    },

    paymentFailed: async (orderId: string, customerEmail: string, reason?: string) => {
        return createNotification({
            type: "payment_failed",
            title: "Payment Failed",
            message: `Payment issue for ${customerEmail}${reason ? `: ${reason}` : ""}`,
            metadata: { orderId, customerEmail, reason },
            priority: "high",
        });
    },

    // Placeholder for future shipping integration
    shippingUpdate: async (orderId: string, status: string, trackingNumber?: string) => {
        return createNotification({
            type: "shipping_update",
            title: "Shipping Status Update",
            message: `Order ${orderId.slice(-6)} - ${status}`,
            metadata: { orderId, status, trackingNumber },
            priority: "low",
        });
    },

    // Placeholder for inventory management
    lowStock: async (productId: string, productName: string, quantity: number) => {
        return createNotification({
            type: "low_stock",
            title: "Low Stock Alert",
            message: `${productName} - Only ${quantity} left in stock`,
            metadata: { productId, productName, quantity },
            priority: "medium",
        });
    },

    // Placeholder for cart tracking
    abandonedCart: async (customerEmail: string, cartValue: number) => {
        return createNotification({
            type: "abandoned_cart",
            title: "Abandoned Cart",
            message: `${customerEmail} left $${cartValue.toFixed(2)} in cart`,
            metadata: { customerEmail, cartValue },
            priority: "low",
        });
    },

    // Placeholder for contact form
    supportInquiry: async (customerEmail: string, subject: string) => {
        return createNotification({
            type: "support_inquiry",
            title: "New Support Inquiry",
            message: `${customerEmail} - ${subject}`,
            metadata: { customerEmail, subject },
            priority: "medium",
        });
    },
};
