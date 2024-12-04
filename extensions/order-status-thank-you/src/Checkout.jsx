import {
  reactExtension,
  BlockStack,
  View,
  Heading,
  Text,
  Button,
  useStorage,
  useApi,
} from "@shopify/ui-extensions-react/checkout";
import { useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
const thankYouBlock = reactExtension("purchase.thank-you.block.render", () => (
  <Attribution />
));

export { thankYouBlock };
const baseUrl = "https://266f-2403-8940-23-6f-cad4-b86e-9e5f-71a.ngrok-free.app";
console.log(baseUrl, "base url");

function Attribution() {
  const [loading, setLoading] = useState(false);
  const orderDetails = useApi();
  // const navigate = useNavigate();
  const {
    orderConfirmation,
    lines,
    shop,
    cost,
    shippingAddress,
    billingAddress,
  } = orderDetails;

  console.log("orderConfirmation", orderDetails);
  const orderId = orderConfirmation?.current?.order?.id?.split("/").pop();
  const orderPayload = {
    orderId,
    shopName: shop?.myshopifyDomain,
    lines: lines.current,
    subTotalAmount: cost?.subtotalAmount?.current,
    totalAmount: cost?.totalAmount?.current,
    totalTaxAmount: cost?.totalTaxAmount?.current,
    totalShippingAmount: cost?.totalShippingAmount?.current,
    shippingAddress: shippingAddress?.current,
    billingAddress: billingAddress.current,
  };
  // console.log(orderPayload, "orderpayload");
  // console.log("orderId", orderId);
  // Store into local storage if the attribution survey was completed by the customer.
  const [attributionSubmitted, setAttributionSubmitted] = useStorageState(
    "attribution-submitted",
  );

  async function handleSubmit() {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const responseData = await fetch(`${baseUrl}/api/orderSaved`, {
            method: "POST",
            body: JSON.stringify(orderPayload),
            headers: {
              "Content-Type": "application/json",
            },
            mode: "no-cors",
          });

          const result = await responseData.json();
          console.log(result, "result================");
          const redirectUrl = `${baseUrl}/shippingLabel.html?orderId=${orderId}`;
          // navigate(redirectUrl);
        } catch (error) {
          console.error("Error uploading file:", error);
        } finally {
          setLoading(false);
          resolve();
        }
        setLoading(false);
      }, 750);
    });
  }

  // Hides the survey if the attribution has already been submitted
  if (attributionSubmitted.loading || attributionSubmitted.data === true) {
    return null;
  }

  return (
    <Survey
      // file={file}
      orderId={orderId}
      title="Attach shipping pdf file with your order?"
      onSubmit={handleSubmit}
      loading={loading}
      />
  );
}
// [END order-status.attribution-survey]

// [START order-status.survey-component]
function Survey({ title, orderId, description, onSubmit, children, loading }) {
  async function handleSubmit() {
    await onSubmit();
  }
  const redirectUrl = `${baseUrl}/shippingLabel.html?orderId=${orderId}`;

  return (
    <View border="base" padding="base" borderRadius="base">
      <BlockStack>
        <Heading>{title}</Heading>
        <Text>{description}</Text>
        {children}
        <Button
          to={redirectUrl}
          kind="secondary"
          onPress={handleSubmit}
          loading={loading}
        >
          Upload Shipping Label PDF
        </Button>
      </BlockStack>
    </View>
  );
}
// [END order-status.survey-component]

/**
 * Returns a piece of state that is persisted in local storage, and a function to update it.
 * The state returned contains a `data` property with the value, and a `loading` property that is true while the value is being fetched from storage.
 */
function useStorageState(key) {
  const storage = useStorage();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function queryStorage() {
      const value = await storage.read(key);
      setData(value);
      setLoading(false);
    }

    queryStorage();
  }, [setData, setLoading, storage, key]);

  const setStorage = useCallback(
    (value) => {
      storage.write(key, value);
    },
    [storage, key],
  );

  return [{ data, loading }, setStorage];
}
