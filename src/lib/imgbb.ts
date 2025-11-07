/**
 * ImgBB API integration for image uploads
 * Uploads images to ImgBB instead of storing base64 in MongoDB
 */

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
const IMGBB_API_URL = "https://api.imgbb.com/1/upload";

interface ImgBBResponse {
  data?: {
    url: string;
    display_url: string;
    delete_url: string;
    id: string;
  };
  success: boolean;
  status: number;
}

/**
 * Upload a single image to ImgBB
 * @param base64Image - Base64 encoded image data
 * @param filename - Optional filename
 * @returns URL of uploaded image or null if failed
 */
export async function uploadImageToImgBB(
  base64Image: string,
  filename?: string
): Promise<string | null> {
  if (!IMGBB_API_KEY) {
    console.error("❌ IMGBB_API_KEY not configured");
    return null;
  }

  try {
    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    let imageData = base64Image;
    if (base64Image.includes(",")) {
      imageData = base64Image.split(",")[1];
    }

    const formData = new FormData();
    formData.append("image", imageData);
    if (filename) {
      formData.append("name", filename);
    }
    // Set expiration to 90 days (7776000 seconds)
    formData.append("expiration", "7776000");

    const response = await fetch(`${IMGBB_API_URL}?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error(
        "❌ ImgBB upload failed:",
        response.status,
        response.statusText
      );
      return null;
    }

    const result: ImgBBResponse = await response.json();

    if (result.success && result.data?.url) {
      console.log("✅ Image uploaded to ImgBB:", result.data.url);
      return result.data.url;
    } else {
      console.error("❌ ImgBB response unsuccessful:", result);
      return null;
    }
  } catch (error) {
    console.error("❌ Error uploading to ImgBB:", error);
    return null;
  }
}

/**
 * Upload multiple images to ImgBB
 * @param base64Images - Array of base64 encoded images
 * @returns Array of URLs
 */
export async function uploadImagesToImgBB(
  base64Images: string[]
): Promise<string[]> {
  const uploadPromises = base64Images.map((img, index) =>
    uploadImageToImgBB(img, `image_${Date.now()}_${index}`)
  );

  const urls = await Promise.all(uploadPromises);
  return urls.filter((url): url is string => url !== null);
}

/**
 * Delete image from ImgBB using delete URL
 * @param deleteUrl - Delete URL provided by ImgBB
 */
export async function deleteImageFromImgBB(
  deleteUrl: string
): Promise<boolean> {
  try {
    const response = await fetch(deleteUrl, {
      method: "GET",
    });

    if (response.ok) {
      console.log("✅ Image deleted from ImgBB");
      return true;
    } else {
      console.error(
        "❌ Failed to delete image from ImgBB:",
        response.statusText
      );
      return false;
    }
  } catch (error) {
    console.error("❌ Error deleting image from ImgBB:", error);
    return false;
  }
}
