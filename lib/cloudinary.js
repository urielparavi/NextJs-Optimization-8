import { v2 as cloudinary } from 'cloudinary';

// Check that all required Cloudinary environment variables are set before continuing
// This helps catch misconfiguration early and prevents runtime errors.
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error('CLOUDINARY_CLOUD_NAME is not set');
}

if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error('CLOUDINARY_API_KEY is not set');
}

if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_API_SECRET is not set');
}

// Configure Cloudinary client with credentials from environment variables
// These credentials allow us to securely communicate with the Cloudinary API.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload an image file to Cloudinary
export async function uploadImage(image) {
  // Convert the uploaded File/Blob to an ArrayBuffer (raw binary data)
  // This is needed so we can encode the image in base64 for upload.
  const imageData = await image.arrayBuffer();

  // Extract the MIME type of the image, like 'image/jpeg' or 'image/png'
  // This is used to construct a proper data URI.
  const mime = image.type;

  // Specify the encoding format for the base64 string
  const encoding = 'base64';

  // Convert the raw ArrayBuffer into a base64 encoded string
  // Buffer is a Node.js global class useful for binary data handling.
  const base64Data = Buffer.from(imageData).toString('base64');

  // Construct a data URI combining the MIME type, encoding, and base64 data
  // This format is accepted by Cloudinary uploader to handle raw image data.
  // data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...
  const fileUri = `data:${mime};${encoding},${base64Data}`;

  // Upload the image to Cloudinary and store it inside the 'nextjs' folder for organization
  // The upload method returns metadata including the secure URL of the uploaded image.
  const result = await cloudinary.uploader.upload(fileUri, {
    folder: 'nextjs',
  });

  // Return the URL where the uploaded image can be accessed securely (HTTPS)
  return result.secure_url;
  // https://res.cloudinary.com/dlwm02l1u/image/upload/v1749298486/nextjs/pqanxkasnj5yaoutkf8h.jpg
}
