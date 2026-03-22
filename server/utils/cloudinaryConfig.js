import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Cloudinary config
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.cloudinary') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Get environment-specific Cloudinary folder
 * @returns {string} Folder name for current environment
 */
export function getCloudinaryFolder() {
  const environment = process.env.NODE_ENV;
  
  if (environment === 'production') {
    return 'graphene-uploads';
  } else if (environment === 'staging') {
    return 'graphene-uploads-staging';
  } else {
    // Development and all other environments
    return 'graphene-uploads-dev';
  }
}

/**
 * Convert local path to Cloudinary URL format
 * @param {string} localPath - Original local file path
 * @returns {string} Cloudinary URL
 */
export function localPathToCloudinaryUrl(localPath) {
  // Remove file extension and encode spaces and special characters
  const pathWithoutExt = localPath.replace(/\.[^.]+$/, '');
  const encodedPath = pathWithoutExt.replace(/ /g, '%20').replace(/\&/g, '%26');
  
  // Get file extension
  const ext = localPath.match(/\.[^.]+$/)?.[0] || '';
  
  // Determine resource type based on extension
  const isRaw = ['.xlsm', '.xlsx', '.xls', '.docx', '.doc', '.csv', '.txt'].includes(ext.toLowerCase());
  const resourceType = isRaw ? 'raw' : 'image';
  
  // Use environment-specific folder
  const folder = getCloudinaryFolder();
  
  // Construct Cloudinary URL
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/v1757814746/${folder}/${encodedPath}${isRaw ? ext : ext + '.pdf'}`;
}

/**
 * Upload file to Cloudinary with environment-specific configuration
 * @param {string} filePath - Local file path to upload
 * @param {string} relativePath - Relative path for public_id
 * @returns {Promise<object>} Upload result with secure_url
 */
export async function uploadToCloudinary(filePath, relativePath) {
  try {
    const ext = path.extname(relativePath).toLowerCase();
    const isRaw = ['.xlsm', '.xlsx', '.docx'].includes(ext);
    
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: relativePath.replace(/\.[^.]+$/, ''), // Remove extension
      resource_type: isRaw ? 'raw' : 'auto',
      folder: getCloudinaryFolder(), // Environment-specific folder
    });
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of file to delete
 * @param {string} resourceType - Type of resource ('image', 'raw', etc.)
 * @returns {Promise<object>} Deletion result
 */
export async function deleteFromCloudinary(publicId, resourceType = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if current environment should use Cloudinary
 * @returns {boolean} True if should use Cloudinary
 */
export function shouldUseCloudinary() {
  // Always use Cloudinary in production
  if (process.env.NODE_ENV === 'production') {
    return true;
  }
  
  // In development, check USE_CLOUDINARY flag and configuration
  const useCloudinaryFlag = process.env.USE_CLOUDINARY === 'true';
  const hasCloudinaryConfig = !!(process.env.CLOUDINARY_CLOUD_NAME && 
                                 process.env.CLOUDINARY_API_KEY && 
                                 process.env.CLOUDINARY_API_SECRET);
  
  return useCloudinaryFlag && hasCloudinaryConfig;
}

export { cloudinary };