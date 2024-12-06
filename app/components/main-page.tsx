"use client";

import { Button, Card, Divider, Link, Page, Text } from "@shopify/polaris";
import { useEffect, useState } from "react";

interface Order {
  orderId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  createdAt: string;
  orderNumber?: string;
}

interface Pagination {
  totalOrders: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export default function Home({ shop }: { shop: string }) {
  console.log(shop, "shop******************");
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageNo, setPageNo] = useState<number>(1); // State for current page
  const [limit, setLimit] = useState<number>(10);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const fetchOrders = async (pageNo: number, limit: number) => {
    setLoading(true);
    try {
      console.log("Calling API");
      const response = await fetch(
        `/api/orderListing?pageNo=${pageNo}&limit=${limit}&shopName=${shop}`,
      );
      const result = (await response.json()) as any;
      // console.log(result, "result afasdsddds****************");
      setOrders(result?.data?.orders);
      setPagination(result?.data?.pagination);
    } catch (err) {
      console.log(err, "error while getting all order details listing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(pageNo, limit);
  }, [pageNo, limit]);

  const handleNextPage = () => {
    if (pagination && pagination.currentPage < pagination.totalPages) {
      setPageNo(pagination.currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination && pagination.currentPage > 1) {
      setPageNo(pagination.currentPage - 1);
    }
  };

  return (
    <Page title="Dashboard">
      {/* <div className="flex items-center justify-center gap-1 p-2 bg-orange-400 text-white rounded-lg mb-2">
        <p className="font-medium text-[1rem]">
          We can also use tailwindcss in this project!
        </p>
      </div> */}

      <Card>
        <Text as="h2" variant="headingLg">
          Order Shipping Label Files
        </Text>
        <br />
        <Divider />
        {loading ? (
          <Text as="p" variant="bodyMd">
            Loading...
          </Text>
        ) : (
          <>
            <table
              className="Polaris-DataTable"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Order Number
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Order ID
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    File Name
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    File Type
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Created At
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders?.map((order) => (
                  <tr key={order.orderId}>
                    <td style={{ padding: "12px" }}>
                      {order?.orderNumber || ""}
                    </td>

                    <td style={{ padding: "12px" }}>{order?.orderId}</td>
                    <td style={{ padding: "12px" }}>{order?.fileName}</td>
                    <td style={{ padding: "12px" }}>{order?.fileType}</td>
                    <td style={{ padding: "12px" }}>
                      {new Date(order?.createdAt).toLocaleString("en-US", {
                        timeZone: userTimeZone, // Use the user's time zone
                        // weekday: 'long', // Day of the week
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        // hour: '2-digit',
                        // minute: '2-digit',
                        // second: '2-digit',
                      })}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <Link url={order?.fileUrl}>View</Link>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={2}>No orders available</td>
                  </tr>
                )}
              </tbody>
            </table>
            <Divider />
            {pagination && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "10px",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  onClick={handlePrevPage}
                  disabled={pagination.currentPage <= 1}
                >
                  Previous
                </Button>
                <Text as="span" variant="bodyMd">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </Text>
                <Button
                  onClick={handleNextPage}
                  disabled={pagination.currentPage >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </Page>
  );
}
