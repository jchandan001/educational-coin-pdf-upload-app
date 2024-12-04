import prisma from "../lib/db/prisma-connect";
export async function saveOrderDetails(orderPayload) {
  try {
    console.log("Starting to save or update order details...");
    console.log("Received order payload:", orderPayload);
    // Check if an order with the same orderId exists
    const existingOrder = await prisma.orderDetails.findFirst({
      where: {
        orderId: orderPayload?.orderId,
      },
    });

    if (existingOrder) {
      // If the order exists, update it
      console.log(
        `Order with orderId ${orderPayload?.orderId} already exists. Proceeding to update.`,
      );
      const updatedOrder = await prisma.orderDetails.update({
        where: {
          id: existingOrder?.id, // Use the existing order's ID for the update
        },
        data: {
          orderId: orderPayload?.orderId,
          shopName: orderPayload?.shopName,
          lines: JSON.stringify(orderPayload?.lines),
          subTotalAmount: orderPayload?.subTotalAmount,
          totalAmount: orderPayload?.totalAmount,
          totalTaxAmount: orderPayload?.totalTaxAmount,
          totalShippingAmount: orderPayload.totalShippingAmount,
          shippingAddress: orderPayload?.shippingAddress,
          billingAddress: orderPayload?.billingAddress,
        },
      });
      console.log("Order updated successfully", updatedOrder);
      return updatedOrder;
    } else {
      console.log(
        `No existing order found for orderId ${orderPayload?.orderId}. Proceeding to create a new order.`,
      );
      const savedOrder = await prisma.orderDetails.create({
        data: {
          orderId: orderPayload?.orderId,
          shopName: orderPayload?.shopName,
          lines: JSON.stringify(orderPayload?.lines),
          subTotalAmount: orderPayload?.subTotalAmount,
          totalAmount: orderPayload?.totalAmount,
          totalTaxAmount: orderPayload?.totalTaxAmount,
          totalShippingAmount: orderPayload?.totalShippingAmount,
          shippingAddress: orderPayload?.shippingAddress,
          billingAddress: orderPayload?.billingAddress,
        },
      });
      console.log("Order saved successfully", savedOrder);
      return savedOrder;
    }
  } catch (error) {
    console.error("Error saving or updating order details:", error);
    throw new Error("Failed to save or update order details");
  }
}

export async function getOrderById(orderId) {
  try {
    if (!orderId) {
      return {
        ok: false,
        message: "Required parameters missing.",
      };
    }
    console.log(`Fetching order details for orderId: ${orderId}`);
    const order = await prisma.orderDetails.findFirst({
      where: {
        orderId: orderId,
      },
    });
    if (!order) {
      console.log(`Order with orderId ${orderId} not found.`);
      return { ok: false, message: "No order found." };
    }

    console.log("Order found:", order);
    return { ok: true, order };
  } catch (error) {
    console.error("Error fetching order by id:", error);
    throw new Error("Failed to fetch order details");
  }
}


