/**
 * File URL utilities for handling both local and Cloudinary file paths
 */

/**
 * Convert file path to appropriate URL for display
 * @param {string} filePath - File path from database (local path or Cloudinary URL)
 * @returns {string} Proper URL for file access
 */
function getFileUrl(filePath) {
  if (!filePath) {
    return '';
  }
  
  // If it's already a full URL (Cloudinary), return as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // If it's a local path, prefix with /uploads/
  if (filePath.startsWith('/uploads/')) {
    return filePath;
  }
  
  // If it's just a relative path, prefix with /uploads/
  return `/uploads/${filePath}`;
}

/**
 * Get PDF URL with viewer parameters
 * @param {string} filePath - File path from database
 * @returns {string} PDF URL with viewer parameters
 */
function getPdfUrl(filePath) {
  console.log('getPdfUrl called with:', filePath);
  const baseUrl = getFileUrl(filePath);
  console.log('Generated base URL:', baseUrl);
  
  // Don't add viewer parameters to Cloudinary URLs
  if (baseUrl.includes('cloudinary.com')) {
    console.log('Using Cloudinary URL without viewer params');
    return baseUrl;
  }
  
  // Add viewer parameters for local PDFs
  const finalUrl = baseUrl + '#navpanes=0&toolbar=0';
  console.log('Final PDF URL:', finalUrl);
  return finalUrl;
}

/**
 * Check if file path is a Cloudinary URL
 * @param {string} filePath - File path to check
 * @returns {boolean} True if Cloudinary URL
 */
function isCloudinaryUrl(filePath) {
  return filePath && filePath.includes('cloudinary.com');
}

/**
 * Open file in new tab with proper URL handling
 * @param {string} filePath - File path from database
 */
function openFile(filePath) {
  const url = getFileUrl(filePath);
  if (url) {
    window.open(url, '_blank');
  }
}

/**
 * Open PDF in modal viewer (for modal stacking system)
 * @param {string} filePath - File path from database
 * @param {string} title - Title for the modal
 */
function openPdfInModal(filePath, title) {
  const url = getPdfUrl(filePath);
  if (url && window.openPdfInModal) {
    window.openPdfInModal(url, title);
  } else {
    // Fallback to opening in new tab
    openFile(filePath);
  }
}

// Make functions globally available
window.getFileUrl = getFileUrl;
window.getPdfUrl = getPdfUrl;
window.isCloudinaryUrl = isCloudinaryUrl;
window.openFileUtil = openFile;
window.openPdfInModalUtil = openPdfInModal;