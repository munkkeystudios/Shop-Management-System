import { useEffect, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import logoImage from '../images/logo-small.png'; // Default logo as fallback

/**
 * Component to manage document title and favicon based on company settings
 * This component doesn't render anything visible but updates the document head
 */
const DocumentHead = () => {
  // Get settings from context
  const { settings } = useSettings();

  // Function to convert an image to a favicon
  const convertImageToFavicon = useCallback((imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Create a canvas with 32x32 dimensions (standard favicon size)
          const canvas = document.createElement('canvas');
          canvas.width = 32;
          canvas.height = 32;

          // Draw the image on the canvas
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 32, 32);

          // Convert to data URL
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } catch (error) {
          console.error('Error converting image to favicon:', error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error('Error loading image for favicon:', error);
        reject(error);
      };

      // Set crossOrigin to anonymous to avoid CORS issues
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
    });
  }, []);

  // Function to update document head based on settings
  const updateDocumentHead = useCallback(async (settings) => {
    if (!settings) return;

    // Update document title with company name
    if (settings.companyName) {
      document.title = settings.companyName;
    } else {
      document.title = 'Shop Management System';
    }

    try {
      // Update favicon with company logo
      let logoUrl = settings.companyLogo || settings.logoUrl;

      if (logoUrl) {
        // Create a base URL for relative paths
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002';

        // Create full URL for the logo
        const fullLogoUrl = logoUrl.startsWith('http')
          ? logoUrl
          : `${baseUrl}${logoUrl}`;

        // Try to convert the image to a proper favicon
        try {
          const faviconDataUrl = await convertImageToFavicon(fullLogoUrl);

          // Create a link element for the favicon
          const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
          link.type = 'image/png';
          link.rel = 'shortcut icon';
          link.href = faviconDataUrl;

          // Add to document head if it doesn't exist
          if (!document.querySelector("link[rel*='icon']")) {
            document.getElementsByTagName('head')[0].appendChild(link);
          } else {
            // Update existing favicon
            document.querySelector("link[rel*='icon']").href = faviconDataUrl;
          }
        } catch (error) {
          // If conversion fails, use the original image
          const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
          link.type = 'image/x-icon';
          link.rel = 'shortcut icon';
          link.href = fullLogoUrl;

          if (!document.querySelector("link[rel*='icon']")) {
            document.getElementsByTagName('head')[0].appendChild(link);
          } else {
            document.querySelector("link[rel*='icon']").href = fullLogoUrl;
          }
        }
      } else {
        // Use default logo if no custom logo is set
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/png';
        link.rel = 'shortcut icon';
        link.href = logoImage;

        if (!document.querySelector("link[rel*='icon']")) {
          document.getElementsByTagName('head')[0].appendChild(link);
        }
      }
    } catch (error) {
      console.error('Error updating favicon:', error);
    }
  }, [convertImageToFavicon]);

  // Update document title and favicon when settings change
  useEffect(() => {
    if (settings) {
      updateDocumentHead(settings);
    }
  }, [settings, updateDocumentHead]);

  // This component doesn't render anything visible
  return null;
};

export default DocumentHead;
