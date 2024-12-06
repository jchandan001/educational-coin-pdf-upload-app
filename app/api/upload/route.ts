import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_S3_ACCESS_SECRET as string,
  },
});
import { uploadEducationalPdf } from "../../../services/educational";
console.log("S3 client initialized");

async function uploadImageToS3(
  file: Buffer,
  fileName: string,
  mimeType: string,
): Promise<any> {
  console.log("Preparing to resize and upload file:", file, fileName);
  console.log("File resized successfully");

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME as string,
    Key: `shipping-label-${fileName}`,
    Body: file,
    ContentType: mimeType,
  };

  console.log("S3 upload parameters prepared:", params);

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  const signedUrlParams = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME as string,
    Key: `shipping-label-${fileName}`,
    ContentType: "application/pdf",
  });

  console.log("File uploaded to S3 successfully:", fileName);
  const signedUrl = await getSignedUrl(s3Client, signedUrlParams, {
    expiresIn: 3600,
  });
  console.log(signedUrl, "signedUrl*************");
  // Public object URL (if ACL is 'public-read')
  const objectUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/shipping-label-${fileName}`;
  console.log("Object public URL:", objectUrl);
  // https://pdf-bucket-shopify.s3.us-east-2.amazonaws.com/shipping-label-6311651967258.pdf
  return { fileName, fileUrl: objectUrl };
}

export async function POST(request: NextRequest, response: NextResponse) {
  console.log("Received POST request");

  try {
    const formData = await request.formData();
    console.log("Form data extracted", formData);

    const file = formData.get("file") as Blob | null;
    console.log("File retrieved from form data:", file);

    if (!file) {
      console.error("No file provided in the form data");
      return NextResponse.json(
        { error: "File blob is required." },
        { status: 400 },
      );
    }

    const mimeType = file.type;
    console.log("File MIME type:", mimeType);

    const allowedMimeTypes = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "text/plain",
      "application/pdf",
    ];

    if (!allowedMimeTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: "Invalid file format." },
        { status: 400 },
      );
    }

    const fileExtension = mimeType.split("/")[1];
    console.log("File extension:", fileExtension);

    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");
    console.log("Order ID from query parameters:", orderId);

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("File converted to Buffer", buffer);

    const { fileName, fileUrl } = await uploadImageToS3(
      buffer,
      `${orderId}.${fileExtension}`,
      mimeType,
    );
    console.log("File uploaded with name:", fileName, fileUrl);
    //     if (signedUrl) {
    //       console.log("Signed URL generated successfully.");
    //       return NextResponse.json({ signedUrl });
    //     }
    
    await uploadEducationalPdf({
      orderId,
      fileName,
      fileType: mimeType,
      fileUrl,
    });
    return NextResponse.json({ success: true, fileName });
  } catch (error) {
    console.error("Error during file upload process:", error);
    return NextResponse.json({ message: "Error uploading image" });
  }
}
