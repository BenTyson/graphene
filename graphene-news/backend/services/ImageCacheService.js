import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class ImageCacheService {
  constructor() {
    this.cacheDirectory = path.join(process.cwd(), 'public', 'news-images');
    this.maxImageSize = 5 * 1024 * 1024; // 5MB
    this.allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    this.cacheDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    this.ensureCacheDirectory();
  }

  // Ensure cache directory exists
  async ensureCacheDirectory() {
    try {
      await fs.access(this.cacheDirectory);
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(this.cacheDirectory, { recursive: true });
      console.log(`Created image cache directory: ${this.cacheDirectory}`);
    }
  }

  // Process and cache images for an article
  async processArticleImages(articleId, imageUrls) {
    const cachedImages = [];
    
    for (const imageUrl of imageUrls) {
      try {
        const cachedImage = await this.cacheImage(imageUrl, articleId);
        if (cachedImage) {
          cachedImages.push(cachedImage);
        }
      } catch (error) {
        console.warn(`Failed to cache image ${imageUrl}:`, error.message);
      }
    }
    
    return cachedImages;
  }

  // Cache a single image
  async cacheImage(imageUrl, articleId) {
    try {
      // Generate cache filename
      const imageHash = this.generateImageHash(imageUrl);
      const extension = this.getFileExtension(imageUrl) || 'jpg';
      const filename = `${imageHash}.${extension}`;
      const filePath = path.join(this.cacheDirectory, filename);
      const publicPath = `/news-images/${filename}`;

      // Check if image already cached
      try {
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          console.log(`Image already cached: ${filename}`);
          return {
            originalUrl: imageUrl,
            cachedPath: publicPath,
            filename: filename,
            size: stats.size,
            cachedAt: stats.mtime
          };
        }
      } catch (error) {
        // File doesn't exist, continue with caching
      }

      // Fetch image
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'GrapheneNews/1.0 (Image Cache Service)',
          'Accept': 'image/*'
        },
        timeout: 10000 // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Validate content type
      const contentType = response.headers.get('content-type');
      if (!this.allowedMimeTypes.includes(contentType)) {
        throw new Error(`Unsupported image type: ${contentType}`);
      }

      // Check content length
      const contentLength = parseInt(response.headers.get('content-length') || '0');
      if (contentLength > this.maxImageSize) {
        throw new Error(`Image too large: ${contentLength} bytes`);
      }

      // Download and save image
      const buffer = await response.buffer();
      
      // Additional size check
      if (buffer.length > this.maxImageSize) {
        throw new Error(`Image too large: ${buffer.length} bytes`);
      }

      await fs.writeFile(filePath, buffer);
      
      const stats = await fs.stat(filePath);
      
      console.log(`Cached image: ${filename} (${stats.size} bytes)`);
      
      return {
        originalUrl: imageUrl,
        cachedPath: publicPath,
        filename: filename,
        size: stats.size,
        cachedAt: new Date()
      };

    } catch (error) {
      console.error(`Error caching image ${imageUrl}:`, error);
      throw error;
    }
  }

  // Generate hash for image URL
  generateImageHash(imageUrl) {
    return crypto.createHash('md5').update(imageUrl).digest('hex');
  }

  // Extract file extension from URL
  getFileExtension(url) {
    try {
      const urlPath = new URL(url).pathname;
      const extension = path.extname(urlPath).slice(1).toLowerCase();
      
      // Map common extensions
      const extensionMap = {
        'jpeg': 'jpg',
        'jpg': 'jpg',
        'png': 'png',
        'webp': 'webp',
        'gif': 'gif'
      };
      
      return extensionMap[extension] || 'jpg';
    } catch (error) {
      return 'jpg'; // Default extension
    }
  }

  // Clean up old cached images
  async cleanupOldImages() {
    try {
      const files = await fs.readdir(this.cacheDirectory);
      const now = Date.now();
      let cleanedCount = 0;

      for (const filename of files) {
        const filePath = path.join(this.cacheDirectory, filename);
        
        try {
          const stats = await fs.stat(filePath);
          const age = now - stats.mtime.getTime();
          
          if (age > this.cacheDuration) {
            await fs.unlink(filePath);
            cleanedCount++;
            console.log(`Cleaned up old cached image: ${filename}`);
          }
        } catch (error) {
          console.warn(`Error checking file ${filename}:`, error);
        }
      }

      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} old cached images`);
      }

      return cleanedCount;
    } catch (error) {
      console.error('Error during image cache cleanup:', error);
      throw error;
    }
  }

  // Get cache statistics
  async getCacheStats() {
    try {
      const files = await fs.readdir(this.cacheDirectory);
      let totalSize = 0;
      let fileCount = 0;

      for (const filename of files) {
        const filePath = path.join(this.cacheDirectory, filename);
        
        try {
          const stats = await fs.stat(filePath);
          if (stats.isFile()) {
            totalSize += stats.size;
            fileCount++;
          }
        } catch (error) {
          // Skip files that can't be accessed
        }
      }

      return {
        fileCount,
        totalSize,
        totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
        cacheDirectory: this.cacheDirectory
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        fileCount: 0,
        totalSize: 0,
        totalSizeMB: 0,
        cacheDirectory: this.cacheDirectory
      };
    }
  }

  // Process images from article URL by scraping
  async extractImagesFromUrl(articleUrl) {
    try {
      const response = await fetch(articleUrl, {
        headers: {
          'User-Agent': 'GrapheneNews/1.0 (Image Extraction)',
          'Accept': 'text/html,application/xhtml+xml'
        },
        timeout: 15000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const { load } = await import('cheerio');
      const $ = load(html);
      
      const images = new Set();

      // Extract images from various sources
      // Open Graph image
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) images.add(this.resolveUrl(ogImage, articleUrl));

      // Twitter Card image
      const twitterImage = $('meta[name="twitter:image"]').attr('content');
      if (twitterImage) images.add(this.resolveUrl(twitterImage, articleUrl));

      // Article images
      $('article img, .article img, .content img, main img').each((i, img) => {
        const src = $(img).attr('src');
        if (src) images.add(this.resolveUrl(src, articleUrl));
      });

      // Featured images
      $('.featured-image img, .hero-image img, .article-image img').each((i, img) => {
        const src = $(img).attr('src');
        if (src) images.add(this.resolveUrl(src, articleUrl));
      });

      // Limit to first 5 images to avoid overload
      return Array.from(images).slice(0, 5);

    } catch (error) {
      console.warn(`Failed to extract images from ${articleUrl}:`, error);
      return [];
    }
  }

  // Resolve relative URLs
  resolveUrl(url, baseUrl) {
    try {
      return new URL(url, baseUrl).href;
    } catch (error) {
      return null;
    }
  }
}