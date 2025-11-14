import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
const configureCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    console.log('☁️ Cloudinary configured successfully');
    
    // Test connection
    return cloudinary.api.ping()
      .then(() => {
        console.log('✅ Cloudinary connection test successful');
      })
      .catch((error) => {
        console.error('❌ Cloudinary connection test failed:', error.message);
      });
  } catch (error) {
    console.error('❌ Cloudinary configuration failed:', error.message);
  }
};

// Initialize configuration
configureCloudinary();

// Upload options for different file types
export const uploadOptions = {
  images: {
    resource_type: 'image',
    folder: 'idolbe/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 1920, height: 1080, crop: 'limit' }
    ],
    eager: [
      { width: 400, height: 400, crop: 'thumb', gravity: 'face' },
      { width: 800, height: 600, crop: 'fill' }
    ]
  },
  
  videos: {
    resource_type: 'video',
    folder: 'idolbe/videos',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    chunk_size: 6000000, // 6MB chunks for large files
    eager_async: true, // Process transformations asynchronously
    eager_notification_url: process.env.CLOUDINARY_WEBHOOK_URL, // Optional: webhook for transformation completion
    transformation: [
      { quality: 'auto' },
      { width: 1920, height: 1080, crop: 'limit' }
    ],
    eager: [
      { 
        width: 640, 
        height: 480, 
        crop: 'fill',
        video_codec: 'h264',
        audio_codec: 'aac',
        streaming_profile: 'hd'
      }
    ]
  },

  avatars: {
    resource_type: 'image',
    folder: 'idolbe/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [
      { width: 200, height: 200, crop: 'thumb', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  }
};

// Helper function to upload file to Cloudinary
export const uploadToCloudinary = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        ...options,
        use_filename: true,
        unique_filename: true
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

// Helper function to delete file from Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    
    console.log('Cloudinary delete result:', result);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Helper function to get optimized URL
export const getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...options
  });
};

export default cloudinary;