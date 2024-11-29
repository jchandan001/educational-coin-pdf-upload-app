// // // File: app/api/presigned/route.ts

// import { NextResponse, type NextRequest } from "next/server";

// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// export async function GET(request: NextRequest) {
//   try {
//     console.log("upload api - START");
//     const accessKeyId = process.env.AWS_S3_ACCESS_KEY;
//     const region = process.env.AWS_S3_REGION;
//     const secretAccessKey = process.env.AWS_S3_ACCESS_SECRET;
//     const s3BucketName = process.env.AWS_S3_BUCKET_NAME;
//     console.log("Environment Variables:", {
//       accessKeyId: accessKeyId ? "Present" : "Missing",
//       region,
//       secretAccessKey: secretAccessKey ? "Present" : "Missing",
//       s3BucketName: s3BucketName ? "Present" : "Missing",
//     });
//     if (!accessKeyId || !secretAccessKey || !s3BucketName) {
//       console.error("Missing AWS S3 configuration.");
//       return new Response(null, { status: 500 });
//     }
//     const searchParams = request.nextUrl.searchParams;
//     const fileName = searchParams.get("fileName");
//     const orderId = searchParams.get("orderId");
//     const contentType = searchParams.get("contentType");

//     console.log("Received parameters:", { fileName, orderId, contentType });

//     if (!fileName || !contentType) {
//       console.error("Missing fileName or contentType.");
//       return new Response(null, { status: 400 });
//     }
//     console.log("Initializing S3 client...");
//     const client = new S3Client({
//       region: region,
//       credentials: {
//         accessKeyId,
//         secretAccessKey,
//       },
//     });
//     console.log(`Creating PutObjectCommand for file: ${fileName}`);
//     const command = new PutObjectCommand({
//       Bucket: s3BucketName,
//       Key: fileName,
//       ContentType: contentType,
//     });
//     console.log("Generating signed URL...");
//     const signedUrl = await getSignedUrl(client, command, { expiresIn: 300 });
//     console.log(signedUrl, "signedUrl*************");
//     if (signedUrl) {
//       console.log("Signed URL generated successfully.");
//       return NextResponse.json({ signedUrl });
//     }
//     console.error("Failed to generate signed URL.");
//     return new Response(null, { status: 500 });
//   } catch (error) {
//     console.error("Error in AWS S3 operation:", error);
//     return new Response(null, { status: 400 });
//   }
// }

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

console.log("S3 client initialized");

async function uploadImageToS3(
  file: Buffer,
  fileName: string,
): Promise<string> {
  console.log("Preparing to resize and upload file:", file, fileName);
  console.log("File resized successfully");

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME as string,
    Key: `shipping-label-${fileName}`,
    Body: file,
    ContentType: "application/pdf",
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

  return fileName;
}

export async function POST(request: NextRequest, response: NextResponse) {
  console.log("Received POST request");

  try {
    const formData = await request.formData();
    console.log("Form data extracted");

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

    const fileExtension = mimeType.split("/")[1];
    console.log("File extension:", fileExtension);

    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");
    console.log("Order ID from query parameters:", orderId);

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("File converted to Buffer");

    const fileName = await uploadImageToS3(
      buffer,
      `${orderId}.${fileExtension}`,
    );
    console.log("File uploaded with name:", fileName);
    //     if (signedUrl) {
    //       console.log("Signed URL generated successfully.");
    //       return NextResponse.json({ signedUrl });
    //     }
    return NextResponse.json({ success: true, fileName });
  } catch (error) {
    console.error("Error during file upload process:", error);
    return NextResponse.json({ message: "Error uploading image" });
  }
}
