import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { shouldUseCloudinary, uploadToCloudinary, deleteFromCloudinary } from './cloudinaryConfig.js';

/**
 * Enhanced file type detection by reading file magic bytes
 * @param {string} filePath - Path to file to check
 * @returns {string|null} Detected MIME type or null
 */
function detectFileType(filePath) {
  try {
    const buffer = fs.readFileSync(filePath, { start: 0, end: 8 });
    
    // PDF magic bytes: %PDF-
    if (buffer.toString('ascii', 0, 4) === '%PDF') {
      return 'application/pdf';
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting file type:', error);
    return null;
  }
}

/**
 * Validate file content for security threats
 * @param {string} filePath - Path to file to validate
 * @param {string} expectedMimeType - Expected MIME type
 * @returns {boolean} True if file is safe
 */
function validateFileContent(filePath, expectedMimeType) {
  try {
    const detectedType = detectFileType(filePath);
    
    // Ensure detected type matches expected type
    if (detectedType !== expectedMimeType) {
      console.warn(`File type mismatch: expected ${expectedMimeType}, detected ${detectedType}`);
      return false;
    }
    
    // Additional PDF-specific validation
    if (expectedMimeType === 'application/pdf') {
      const buffer = fs.readFileSync(filePath, { start: 0, end: 1024 });
      const content = buffer.toString('binary');
      
      // Check for suspicious content in PDF header
      const suspiciousPatterns = [
        /javascript/i,
        /<script/i,
        /eval\(/i,
        /document\.write/i
      ];
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(content)) {
          console.warn('Suspicious content detected in PDF file');
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error validating file content:', error);
    return false;
  }
}

/**
 * Sanitize filename to prevent directory traversal and other attacks
 * @param {string} originalName - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(originalName) {
  // Remove path separators and dangerous characters
  let sanitized = path.basename(originalName)
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/^\.+/, '')
    .substring(0, 255); // Limit length
  
  // Ensure filename is not empty
  if (!sanitized || sanitized === '_') {
    sanitized = 'file';
  }
  
  return sanitized;
}

/**
 * Creates a standardized multer file upload middleware with enhanced security
 * @param {string} destination - Upload directory name (e.g., 'bet-reports')
 * @param {object} options - Configuration options
 * @param {string[]} options.allowedTypes - MIME types (default: ['application/pdf'])
 * @param {number} options.maxSize - Max file size in bytes (default: 10MB)
 * @param {string[]} options.allowedExtensions - File extensions (default: ['.pdf'])
 * @param {boolean} options.validateContent - Enable content validation (default: true)
 */
export function createFileUploadMiddleware(destination, options = {}) {
  const {
    allowedTypes = ['application/pdf'],
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedExtensions = ['.pdf'],
    validateContent = true
  } = options;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads', destination);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Sanitize and create unique filename
      const timestamp = Date.now();
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = sanitizeFilename(path.basename(file.originalname, ext));
      cb(null, `${baseName}_${timestamp}${ext}`);
    }
  });

  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      
      // Validate filename
      const sanitizedName = sanitizeFilename(file.originalname);
      if (sanitizedName !== file.originalname) {
        console.warn(`Filename sanitized: ${file.originalname} -> ${sanitizedName}`);
      }
      
      // Check MIME type and extension
      if (!allowedTypes.includes(file.mimetype) || !allowedExtensions.includes(ext)) {
        const allowedExtsStr = allowedExtensions.join(', ');
        cb(new Error(`Only ${allowedExtsStr} files are allowed. Detected: ${file.mimetype}`), false);
        return;
      }
      
      // Check for null bytes (potential attack)
      if (file.originalname.includes('\0')) {
        cb(new Error('Invalid filename detected'), false);
        return;
      }
      
      cb(null, true);
    },
    limits: {
      fileSize: maxSize,
      files: 10, // Limit number of files
      fieldSize: 1024 * 1024, // 1MB field size limit
      fieldNameSize: 100 // Limit field name length
    }
  });

  // Add post-upload validation if enabled
  if (validateContent) {
    const originalSingle = upload.single;
    upload.single = function(fieldName) {
      const middleware = originalSingle.call(this, fieldName);
      return (req, res, next) => {
        middleware(req, res, (err) => {
          if (err) {
            return next(err);
          }
          
          // Perform content validation if file was uploaded
          if (req.file) {
            const isValid = validateFileContent(req.file.path, req.file.mimetype);
            if (!isValid) {
              // Delete invalid file
              deleteFile(req.file.path);
              return next(new Error('File content validation failed'));
            }
          }
          
          next();
        });
      };
    };
  }

  return upload;
}

/**
 * Delete file from filesystem with error handling
 * @param {string} filePath - Full path to file
 */
export function deleteFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }
}

/**
 * Handle file replacement logic
 * @param {string} oldPath - Path to old file to delete
 * @param {object} file - New file object from multer
 * @returns {string|null} New file path or null
 */
export function replaceFile(oldPath, file) {
  // Delete old file if it exists
  if (oldPath) {
    const fullOldPath = path.join(process.cwd(), 'uploads', oldPath);
    deleteFile(fullOldPath);
  }
  
  // Return new file path relative to uploads directory
  return file ? path.relative(path.join(process.cwd(), 'uploads'), file.path) : null;
}

/**
 * Upload file to appropriate storage (local or Cloudinary)
 * @param {object} file - Multer file object
 * @param {string} destination - Destination folder (e.g., 'sem-reports')
 * @returns {Promise<object>} Upload result with path/url
 */
export async function uploadFile(file, destination) {
  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  if (shouldUseCloudinary()) {
    // Upload to Cloudinary
    const relativePath = path.join(destination, path.basename(file.filename || file.originalname));
    const result = await uploadToCloudinary(file.path, relativePath);
    
    // Clean up temporary file
    deleteFile(file.path);
    
    return {
      success: result.success,
      path: result.success ? result.url : null,
      error: result.error,
      isCloudinary: true
    };
  } else {
    // Use local storage
    const relativePath = path.relative(path.join(process.cwd(), 'uploads'), file.path);
    return {
      success: true,
      path: relativePath,
      isCloudinary: false
    };
  }
}

/**
 * Delete file from appropriate storage (local or Cloudinary)
 * @param {string} filePath - File path/URL to delete
 * @returns {Promise<object>} Deletion result
 */
export async function deleteFileFromStorage(filePath) {
  if (!filePath) {
    return { success: true }; // Nothing to delete
  }

  if (filePath.startsWith('https://res.cloudinary.com/')) {
    // Delete from Cloudinary
    try {
      // Extract public_id from URL
      const urlParts = filePath.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex === -1) {
        throw new Error('Invalid Cloudinary URL format');
      }
      
      // Get everything after version (v123456789/)
      const pathAfterVersion = urlParts.slice(uploadIndex + 2).join('/');
      const publicId = pathAfterVersion.replace(/\.(pdf|xlsx?|xlsm|docx?|csv|txt)(\.(pdf))?$/, '');

      // Determine resource type
      const isRaw = /\.(xlsx?|xlsm|docx?|csv|txt)$/.test(filePath);
      const resourceType = isRaw ? 'raw' : 'image';
      
      return await deleteFromCloudinary(publicId, resourceType);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      return { success: false, error: error.message };
    }
  } else {
    // Delete local file
    const fullPath = path.join(process.cwd(), 'uploads', filePath);
    deleteFile(fullPath);
    return { success: true };
  }
}

/**
 * Handle file replacement with appropriate storage
 * @param {string} oldPath - Old file path/URL to delete
 * @param {object} file - New file object from multer
 * @param {string} destination - Destination folder
 * @returns {Promise<object>} Upload result
 */
export async function replaceFileInStorage(oldPath, file, destination) {
  // Delete old file if it exists
  if (oldPath) {
    await deleteFileFromStorage(oldPath);
  }
  
  // Upload new file
  if (file) {
    return await uploadFile(file, destination);
  }
  
  return { success: true, path: null };
}