// app/api/orderListing/route.ts (or app/api/orderListing/route.js depending on your setup)
import { NextRequest, NextResponse } from "next/server";
import { getAllOrderDetails } from "../../../services/educational"; // Adjust import based on your structure

export async function GET(request: NextRequest) {
  try {
    console.log("Received request to fetch all orders.",request.url);
    const url = new URL(request.url);
    console.log("Received request to fetch all orders.",url);
    const page = parseInt(url.searchParams.get('pageNo') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    console.log(`Received request to fetch all orders, page: ${page}, limit: ${limit}.`);
    // Fetch all orders using your service function
    const allOrders = await getAllOrderDetails(page, limit);

    console.log("Fetched orders successfully:", allOrders);

    // Respond with all orders
    return NextResponse.json(
      { data: allOrders, message: "Orders fetched successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching orders:", error?.message);
    console.error("Error details:", error);

    return NextResponse.json(
      { message: "Error fetching order details." },
      { status: 500 }
    );
  }
}
