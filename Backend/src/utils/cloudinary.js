import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (filePath) => {
  try {
    if (!filePath) {
      console.log("No file path provided to Cloudinary upload.");
      return null;
    }

    console.log("Uploading to Cloudinary:", filePath);

    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    console.log("Cloudinary upload successful:", response.url);

    fs.unlinkSync(filePath); 
    // delete temp file and remember this Task is Sync means whole program stops till the file is deleted from the local path
    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    try {
      fs.unlinkSync(filePath); // clean up even on error
    } catch (cleanupErr) {
      console.warn("Failed to delete temp file:", cleanupErr.message);
    }
    return null;
  }
};

export { uploadCloudinary };
