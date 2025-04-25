import React, { useState, useEffect, useRef } from "react";
import { FaEdit, FaTrash, FaSearch, FaPlus, FaTimes, FaUpload } from 'react-icons/fa';
import Layout from '../components/Layout';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import defaultBrandImage from '../images/default-product-image.jpg';
import './brands.css';

const Brands = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [brandImage, setBrandImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const fileInputRef = useRef(null);
  const { addNotification } = useNotifications();

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await api.get('/brands');
      if (response.data.success) {
        setBrands(response.data.data);
      } else {
        setError('Failed to fetch brands: ' + (response.data.message || 'Unknown error'));
        console.warn('Brands fetch failed:', response.data.message);
      }
    } catch (err) {
      setError('Failed to fetch brands');
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const brandData = {
        name: brandName,
        description: brandDescription,
        image: brandImage
      };

      let response;
      if (editingBrand) {
        response = await api.put(`/brands/${editingBrand._id}`, brandData);
      } else {
        response = await api.post('/brands', brandData);
      }

      if (response.data.success) {
        // Refresh brands list
        await fetchBrands();

        // Add notification
        if (editingBrand) {
          addNotification('brand', `Brand "${brandName}" has been updated`, editingBrand._id);
        } else {
          const brandId = response.data.data?._id;
          addNotification('brand', `New brand "${brandName}" has been created`, brandId);
        }

        // Reset form
        setIsModalOpen(false);
        setBrandName('');
        setBrandDescription('');
        setBrandImage('');
        setImagePreview('');
        setEditingBrand(null);
      } else {
        setError(response.data.message || 'Failed to save brand');
      }
    } catch (err) {
      setError('Failed to save brand');
      console.error('Error saving brand:', err);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setBrandDescription(brand.description || '');
    setBrandImage(brand.image || '');
    setImagePreview(brand.image || '');
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setBrandImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleDelete = async (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const response = await api.delete(`/brands/${brandId}`);
        if (response.data.success) {
          // Add notification
          addNotification('brand', `Brand "${brands.find(b => b._id === brandId)?.name || 'Unknown'}" has been deleted`);
          await fetchBrands();
        } else {
          setError(response.data.message || 'Failed to delete brand');
        }
      } catch (err) {
        setError('Failed to delete brand');
        console.error('Error deleting brand:', err);
      }
    }
  };

  // Filter brands based on search term
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Brands">
      <div className="categories-frame">
        <div className="categories-div-2">
          <div className="categories-div-3">
            <div className="categories-div-4">
              <div className="categories-text-2">Brands</div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="categories-search-container">
              <FaSearch className="categories-search-icon" />
              <input
                type="text"
                placeholder="Search brands"
                className="categories-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="categories-div-6">
              <div className="categories-div-7">
                <table className="categories-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Brand Name</th>
                      <th>Brand Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4">Loading...</td>
                      </tr>
                    ) : filteredBrands.map((brand) => (
                      <tr key={brand._id}>
                        <td>
                          <div className="brand-image-container">
                            <img
                              src={brand.image || defaultBrandImage}
                              alt={brand.name}
                              className="brand-image"
                            />
                          </div>
                        </td>
                        <td>{brand.name}</td>
                        <td>{brand.description}</td>
                        <td>
                          <div className="categories-action-buttons">
                            <button
                              className="categories-action-button"
                              onClick={() => handleEdit(brand)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="categories-action-button"
                              onClick={() => handleDelete(brand._id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="categories-action-buttons-container">
            <button
              className="categories-action-button primary"
              onClick={() => {
                setEditingBrand(null);
                setBrandName('');
                setBrandDescription('');
                setIsModalOpen(true);
              }}
            >
              <FaPlus /> Create New Brand
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="categories-modal-overlay">
          <div className="categories-modal">
            <button
              className="categories-modal-close"
              onClick={() => {
                setIsModalOpen(false);
                setEditingBrand(null);
                setBrandName('');
                setBrandDescription('');
                setBrandImage('');
                setImagePreview('');
              }}
            >
              <FaTimes />
            </button>
            <h2 className="categories-modal-title">
              {editingBrand ? 'Edit Brand' : 'Create Brand'}
            </h2>
            <form className="categories-modal-form" onSubmit={handleSubmit}>
              <div className="brand-image-upload-container">
                <div
                  className="brand-image-preview"
                  onClick={handleImageClick}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Brand Preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <FaUpload />
                      <span>Upload Image</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              <input
                type="text"
                placeholder="Enter brand name"
                className="categories-modal-input"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Enter brand description"
                className="categories-modal-description"
                value={brandDescription}
                onChange={(e) => setBrandDescription(e.target.value)}
                required
              />
              <button type="submit" className="categories-modal-submit">
                {editingBrand ? 'Update' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Brands;

