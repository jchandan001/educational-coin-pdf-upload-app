import { NextRequest, NextResponse } from "next/server";
import { saveOrderDetails } from "../../../services/orderDetails"; // Adjust the import based on where your function is located
import { getOrderDetailsById } from "../../../shopifyApi/orderApi";
export async function POST(request: NextRequest) {
  try {
    console.log("Received request to save order.");
    // Parse the JSON body from the request
    const orderPayload = await request.json();
    console.log("Parsed order payload:", orderPayload);
    const orderDetails = await getOrderDetailsById(
      orderPayload?.shopName,
      orderPayload?.orderId,
    );
    // console.log(orderDetails,'orderDetails')

    orderPayload.orderNumber = orderDetails?.name
    console.log(orderPayload,'orderPayload')

    // Call saveOrderDetails function to either create or update the order
    const savedOrder = await saveOrderDetails(orderPayload);
    console.log("Order saved or updated successfully:", savedOrder);
    // Respond with the saved order data
    return NextResponse.json(
      { data: savedOrder, message: "Order saved successfully." },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error saving order:", error?.message);
    console.error("Error details:", error);
    return NextResponse.json(
      { message: "Error during saving order info" },
      { status: 500 },
    );
  }
}
