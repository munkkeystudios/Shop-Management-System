import React, { useRef, useState } from 'react';
import { FiUpload, FiEdit2, FiTrash2 } from 'react-icons/fi';
import './ImageUploader.css';

/**
 * A reusable image uploader component with a modern UI
 * 
 * @param {Object} props Component props
 * @param {Function} props.onFileSelect Callback function when a file is selected
 * @param {Function} props.onRemove Callback function when remove button is clicked
 * @param {String} props.imageUrl Current image URL (if any)
 * @param {Boolean} props.isLoading Whether an upload operation is in progress
 * @param {String} props.baseUrl Base URL to prepend to the image URL
 * @param {String} props.label Label text for the uploader
 * @param {String} props.hint Hint text shown below the uploader
 * @param {Number} props.maxSize Maximum file size in MB (default: 2)
 * @param {String} props.className Additional CSS classes
 */
const ImageUploader = ({
  onFileSelect,
  onRemove,
  imageUrl = '',
  isLoading = false,
  baseUrl = '',
  label = 'Upload Image',
  hint = 'SVG, PNG, JPG or GIF (Max 2 MB files are allowed)',
  maxSize = 2,
  className = '',
}) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');

  // Get full image URL with base URL if needed
  const getFullImageUrl = () => {
    if (!imageUrl) return '';
    return imageUrl.startsWith('http') ? imageUrl : baseUrl + imageUrl;
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Reset previous error
    setError('');
    
    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size should be less than ${maxSize}MB`);
      return;
    }
    
    // Call the callback function with the selected file
    onFileSelect(file);
  };

  return (
    <div className={`image-uploader ${className}`}>
      {label && <label className="uploader-label">{label}</label>}
      
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*" 
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <div className="upload-container">
        {imageUrl ? (
          <div className="current-logo">
            <img 
              src={getFullImageUrl()} 
              alt="Uploaded image" 
            />
            <div className="upload-overlay">
              <div className="image-actions">
                <button 
                  type="button"
                  className="image-action-button"
                  onClick={() => fileInputRef.current.click()}
                >
                  <FiEdit2 size={14} /> Change
                </button>
                {onRemove && (
                  <button 
                    type="button"
                    className="image-action-button remove"
                    onClick={onRemove}
                  >
                    <FiTrash2 size={14} /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div onClick={() => fileInputRef.current.click()}>
            <div className="upload-icon-container">
              <FiUpload className="upload-icon" />
            </div>
            <div className="upload-text">
              <p><span className="upload-link">Click to upload</span> or drag and drop</p>
              <p className="upload-hint">{hint}</p>
            </div>
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className="upload-status">
          <span className="upload-status-spinner"></span>
          Processing image...
        </div>
      )}
      
      {error && (
        <div className="upload-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 