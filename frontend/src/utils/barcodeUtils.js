/**
 * Utility functions for barcode handling
 */

/**
 * Generate a barcode image URL using the barcodeapi.org service
 * @param {string} barcode - The barcode value
 * @returns {string} - The URL for the barcode image
 */
export const generateBarcodeUrl = (barcode) => {
  // Use a default barcode if none is provided
  const barcodeValue = barcode || '000000000000';
  
  // Return the URL for the barcode image
  return `https://barcodeapi.org/api/code128/${barcodeValue}`;
};

/**
 * Generate a fallback SVG for when the barcode image fails to load
 * @returns {string} - Data URL for the fallback SVG
 */
export const getBarcodeFallbackImage = () => {
  return 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22120%22%20height%3D%2230%22%3E%3Crect%20width%3D%22120%22%20height%3D%2230%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Ctext%20x%3D%2260%22%20y%3D%2220%22%20font-family%3D%22Arial%22%20font-size%3D%2210%22%20text-anchor%3D%22middle%22%3EBarcode%20Unavailable%3C%2Ftext%3E%3C%2Fsvg%3E';
};

/**
 * Handle barcode image error by replacing with a fallback image
 * @param {Event} event - The error event
 */
export const handleBarcodeError = (event) => {
  console.error('Barcode image failed to load:', event);
  event.target.onerror = null; // Prevent infinite loop
  event.target.src = getBarcodeFallbackImage();
};
