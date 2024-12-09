const {
  SHOPIFY_ADMIN_API_VERSION,
  SHOPIFY_ACCESS_TOKEN,
} = process.env;

console.log( SHOPIFY_ADMIN_API_VERSION,
  SHOPIFY_ACCESS_TOKEN,'***************************************process env file data')

export const getOrderDetailsById = async (shopName, orderId) => {
  try {
    console.log("Fetching order details for:", { shopName, orderId,SHOPIFY_ADMIN_API_VERSION });

    const response = await fetch(
      `https://${shopName}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/orders/${orderId}.json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        // mode: "no-cors",
      },

    );
    // console.log("API Response:", response);

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      const errorText = await response.json();
      console.log("API Response:", errorText?.error);
      return errorText?.error;
    }

    const orderData = await response.json();
    console.log("fetched order data successfully");
    return orderData?.order;
  } catch (error) {
    console.error("Error fetching order from shopify api:", error?.message,error);
    throw error;
  }
};


export const updateOrderNotesById = async (shopName, orderId, fileUrl) => {
  try {
    console.log("Updating order notes for:", { shopName, orderId, fileUrl });

    const updatePayload = {
      order: {
        id: orderId,
        note: `File Link: ${fileUrl}`,
      },
    };

    const response = await fetch(
      `https://${shopName}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/orders/${orderId}.json`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify(updatePayload),
      }
    );

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      const errorText = await response.json();
      console.log("API Error Response:", errorText?.error);
      return errorText?.error;
    }

    const updatedOrderData = await response.json();
    // console.log("Updated order data successfully:", updatedOrderData);
    return updatedOrderData?.order;
  } catch (error) {
    console.error("Error updating order on Shopify API:", error?.message, error);
    throw error;
  }
};