// "user server";

// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { uploadEducationalPdf } from "../../../services/educational";
// import { promises as fs } from "fs";
// import path from "path";

// // Initialize S3 client
// const s3Client = new S3Client({
//   region: process.env.AWS_S3_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_S3_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_S3_ACCESS_SECRET,
//   },
// });

// console.log("S3 client initialized");

// // Function to upload the file to S3
// async function uploadImageToS3(file, fileName) {
//   const params = {
//     Bucket: process.env.AWS_S3_BUCKET_NAME,
//     Key: `shipping-label-${fileName}`,
//     Body: file,
//     ContentType: "application/pdf",
//   };

//   const command = new PutObjectCommand(params);
//   await s3Client.send(command);

//   const signedUrlParams = new PutObjectCommand({
//     Bucket: process.env.AWS_S3_BUCKET_NAME,
//     Key: `shipping-label-${fileName}`,
//     ContentType: "application/pdf",
//   });

//   const signedUrl = await getSignedUrl(s3Client, signedUrlParams, {
//     expiresIn: 3600,
//   });

//   const objectUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/shipping-label-${fileName}`;
//   return { fileName, fileUrl: objectUrl };
// }

// // Next.js Action function
// export async function UPloadFile(file) {
//   try {
//     console.log(file, "file*************");
//     // const formData = await request.formData();
//     // const file = formData.get("file");

//     // if (!file) {
//     //   return new Response(
//     //     JSON.stringify({ error: "File blob is required." }),
//     //     { status: 400 }
//     //   );
//     // }

//     const mimeType = file.type;
//     const fileExtension = mimeType.split("/")[1];
//     const searchParams = new URL(request.url).searchParams;
//     const orderId = searchParams.get("orderId");
//     console.log(orderId, "orderId*************");

//     const buffer = Buffer.from(await file.arrayBuffer());
//     console.log(buffer, "buffer*************");
//     // Upload file to S3
//     const { fileName, fileUrl } = await uploadImageToS3(
//       buffer,
//       `${orderId}.${fileExtension}`,
//     );

//     // Save file metadata to your database or other services
//     await uploadEducationalPdf({
//       orderId,
//       fileName,
//       fileType: mimeType,
//       fileUrl,
//     });

//     return new Response(JSON.stringify({ success: true, fileName }), {
//       status: 200,
//     });
//   } catch (error) {
//     console.error("Error during file upload process:", error);
//     return new Response(JSON.stringify({ message: "Error uploading image" }), {
//       status: 500,
//     });
//   }
// }
