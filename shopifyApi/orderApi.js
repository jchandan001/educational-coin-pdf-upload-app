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
