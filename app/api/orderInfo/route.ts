import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/services/orderDetails";
export async function POST(req: NextRequest) {
  console.log("Request method:", req.method);

  if (req.method !== "POST") {
    console.log("Invalid request method. Returning 405.");
    return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const requestBody = await req.json();

    const { orderId } = requestBody;

    console.log("Request body parsed:", { orderId });

    if (!orderId) {
      console.log("Missing orderId. Returning 400.");
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 },
      );
    }

    const orderInfo = await getOrderById(orderId);
    if (!orderInfo?.ok) {
      return NextResponse.json(
        { error: orderInfo?.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ data: orderInfo?.order }, { status: 200 });
  } catch (error) {
    console.error("Error fetching order info:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 },
    );
  }
}
