import {
  reactExtension,
  BlockStack,
  View,
  Heading,
  Text,
  ChoiceList,
  Choice,
  Button,
  useStorage,
  TextField,
  useApi,
} from "@shopify/ui-extensions-react/checkout";
import { useCallback, useEffect, useState } from "react";
// [START order-status.extension-point]
// Allow the attribution survey to display on the thank you page.
const thankYouBlock = reactExtension("purchase.thank-you.block.render", () => (
  <Attribution />
));

export { thankYouBlock };
const baseUrl ='https://payments-constraints-liberty-biographies.trycloudflare.com'


function Attribution() {
  const [attribution, setAttribution] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [file, setFile] = useState(null);
  const { orderConfirmation } = useApi();
  const orderId = orderConfirmation?.current?.order?.id?.split("/").pop();
  console.log("orderId", orderId);
  // Store into local storage if the attribution survey was completed by the customer.
  const [attributionSubmitted, setAttributionSubmitted] = useStorageState(
    "attribution-submitted",
  );

  const handleFileChange = (event) => {
    try {
      console.log(event, "event************");
      if (!event) {
        console.log("event not found.");
        setErrorMessage("No file selected.");
        return null;
      }

      setIsFileSelected(true);
      console.log(event?.split(".").pop().toLowerCase(), "extension");

      if (event?.split(".").pop().toLowerCase() !== "pdf") {
        console.log("Only PDF files are allowed.");
        setErrorMessage("Only PDF files are allowed.");
        return;
      }

      setFile(event);
      setErrorMessage("");
    } catch (error) {
      console.log(error, "error while uploading pdf");
      return null;
    }
  };

  async function handleSubmit() {
    // Simulate a server
    // handleFileChange()
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        // const fileBlob = new Blob([event], { type: "application/pdf" }); // Convert to Blob
        // formData.append("file", fileBlob, `shipping_label_${Date.now()}.pdf`);

        if (isFileSelected && errorMessage) {
          setLoading(false);
          return;
        }

        if (!file) {
          setErrorMessage("No file selected.");
          setLoading(false);
          return;
        }

        setErrorMessage("");

        const formData = new FormData();
        const fileBlob = new Blob([file], { type: "application/pdf" });
        console.log(fileBlob, "file blob");
        formData.append("file", fileBlob);
        formData.append("orderId", orderId);

        // formData.append("orderId", orderId);

        console.log(
          JSON.stringify(formData.get("file")),
          "form data============",
        );

        // const fileType = "application/pdf";
        // const fileName = file;

        try {
          fetch(
            `${baseUrl}/api/upload?orderId=${orderId}`,
            {
              method: "POST",
              body: formData,
              mode: "no-cors",
              headers: {
                "Content-Type": "application/json",
              },
            },
          )
            .then((res) => {
              console.log(res, "resonse while uploading");
            })
            .catch((error) => {
              console.log(
                error,
                "error while uploading file on s3*****************",
              );
            });
        } catch (error) {
          console.error("Error uploading file:", error);
        } finally {
          setLoading(false);
          resolve();
        }

        
        // Send the review to the server
        // console.log("Submitted:", attribution);
        setLoading(false);
        // setAttributionSubmitted(true);
        // resolve();
      }, 750);
    });
  }

  // Hides the survey if the attribution has already been submitted
  if (attributionSubmitted.loading || attributionSubmitted.data === true) {
    return null;
  }

  return (
    <Survey
      file={file}
      title="How did you hear about us ?"
      onSubmit={handleSubmit}
      loading={loading}
    >
      <BlockStack spacing="tight">
        <Text>Upload Shipping Label (PDF)</Text>
        <TextField type="file" onChange={handleFileChange}></TextField>
        {errorMessage && <Text appearance="critical">{errorMessage}</Text>}
      </BlockStack>
    </Survey>
  );
}
// [END order-status.attribution-survey]

// [START order-status.survey-component]
function Survey({ title, file, description, onSubmit, children, loading }) {
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    await onSubmit();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <View border="base" padding="base" borderRadius="base">
        <BlockStack>
          {/* <Heading>Thanks for your feedback!</Heading> */}
          <Heading>Thanks for uploading shipping pdf!</Heading>
          {/* <Text>Your response has been submitted</Text> */}
          <Text>Shipping pdf uploaded successfully.</Text>
        </BlockStack>
      </View>
    );
  }

  return (
    <View border="base" padding="base" borderRadius="base">
      <BlockStack>
        <Heading>{title}</Heading>
        <Text>{description}</Text>
        {children}
        <Button kind="secondary" onPress={handleSubmit} loading={loading}>
          Upload shipping label pdf
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
