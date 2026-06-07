import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary client configured from environment variables.
 * Files (PDFs/images attached to cards) are uploaded here; the database
 * only stores the returned URL + public_id, never the file bytes.
 *
 * Required env vars:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

export interface UploadedFile {
  url: string;
  publicId: string;
  bytes: number;
  format?: string;
}

/**
 * Upload a file buffer to Cloudinary.
 * Uses resource_type "auto" so PDFs, images, and other docs all work.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  filename: string
): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "mytracker/attachments",
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
        filename_override: filename,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error("Cloudinary upload failed"));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete a previously uploaded file by its public_id.
 * resource_type "auto" is not valid for destroy, so we try image then raw.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch {
    // Fall back to raw (PDFs and other non-image files)
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  }
}

export { cloudinary };
