import prisma from "../lib/db/prisma-connect";
import { ObjectId } from "mongodb";

export async function uploadEducationalPdf({
  orderId,
  fileName,
  fileType,
  fileUrl,
}) {
  console.log(
    orderId,
    fileName,
    fileType,
    fileUrl,
    "upload education pdf***************",
  );
  try {
    // First, check if the record exists by orderId
    const id = new ObjectId().toString();

    const existingPdf = await prisma.educationalPdfUpload.findFirst({
      where: { orderId: String(orderId) },
    });
    console.log(orderId, "existingPdf", existingPdf);

    if (existingPdf) {
      // If the record exists, update it
      const updatedPdf = await prisma.educationalPdfUpload.update({
        where: { id: existingPdf?.id },
        data: {
          fileName,
          fileType: fileType || "application/pdf",
          fileUrl,
        },
      });
      console.log("PDF Updated:", updatedPdf);
    } else {
      // If the record does not exist, create a new one
      const newPdf = await prisma.educationalPdfUpload.create({
        data: {
          id,
          orderId,
          fileName,
          fileType: fileType || "application/pdf",
          fileUrl,
        },
      });
      console.log("PDF Created:", newPdf);
    }
  } catch (error) {
    console.error("Error uploading or updating PDF:", error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAllOrderDetails(page = 1, limit = 10) {
  try {
    console.log(`Fetching orders for page ${page} with limit ${limit}.`);

    // Calculate the offset (skip) based on the current page and limit
    const offset = (page - 1) * limit;

    // Query the database to fetch orders with pagination
    const orders = await prisma.educationalPdfUpload.findMany({
      skip: offset,
      take: limit, 
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!orders || orders.length === 0) {
      console.log("No orders found.");
      return { ok: false, message: "No orders available." };
    }

    // Fetch total count of orders for pagination purposes
    const totalOrders = await prisma.educationalPdfUpload.count();

    // Calculate total pages
    const totalPages = Math.ceil(totalOrders / limit);

    console.log(`Orders fetched successfully:`, orders);
    return {
      ok: true,
      orders,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Failed to fetch all order details");
  }
}