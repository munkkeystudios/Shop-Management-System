import React, { useState, useEffect, useRef } from "react";
import { FiX } from 'react-icons/fi';
import Layout from '../components/Layout';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import defaultBrandImage from '../images/default-product-image.jpg';
import './brands.css';
import './sales.css';

const Brands = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [brandImage, setBrandImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const brandsWithImage = brands.filter((brand) => !!brand.image).length;
  const brandsWithoutImage = brands.length - brandsWithImage;
  const describedBrands = brands.filter((brand) => (brand.description || '').trim().length > 0).length;

  const mapBrandStatus = (brand) => {
    // If brand has an image it's ready -> completed (green); otherwise treat as pending/basic
    if (brand && brand.image) return { label: 'Ready', className: 'completed' };
    return { label: 'Basic', className: 'pending' };
  };

  return (
    <Layout title="Brands">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div style={{ backgroundColor: '#f7f9fb', minHeight: 'calc(100vh - 80px)', fontFamily: 'Manrope, sans-serif' }}>
        <main style={{ flex: 1, minHeight: '100vh', background: '#f7f9fb' }}>
{loading ? (
  <div className="products-loading-container">
    <div className="block-pulse">
      <div className="block rounded-sm"></div>
      <div className="block rounded-sm"></div>
      <div className="block rounded-sm"></div>
      <div className="block rounded-sm"></div>
      <div className="block rounded-sm"></div>
      <div className="block rounded-sm"></div>
      <div className="block rounded-sm"></div>
      <div className="block rounded-sm"></div>
      <div className="block rounded-sm"></div>
    </div>
  </div>
) : (
  <section style={{ padding: '32px', maxWidth: '100%', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
              <div>
                <p
                  style={{
                    margin: '0 0 4px',
                    color: '#565e74',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontSize: '12px',
                  }}
                >
                  Catalog Overview
                </p>
                <h2 style={{ margin: 0, fontSize: '36px', fontWeight: 700, letterSpacing: '-0.025em', color: '#2a3439' }}>
                  Brands
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '12px',
                      transform: 'translateY(-50%)',
                      color: '#717c82',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>search</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Search brand title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '320px',
                      backgroundColor: '#f0f4f7',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '12px 16px 12px 40px',
                      fontSize: '14px',
                      outline: 'none',
                      boxShadow: 'rgba(15, 23, 42, 0.06) 0px 1px 2px',
                      color: '#2a3439',
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBrand(null);
                    setBrandName('');
                    setBrandDescription('');
                    setBrandImage('');
                    setImagePreview('');
                    setIsModalOpen(true);
                  }}
                  style={{
                    backgroundColor: '#565e74',
                    color: '#f7f7ff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: 'rgba(15, 23, 42, 0.08) 0px 1px 2px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span className="material-symbols-outlined">add</span>
                  Create New Brand
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '24px', marginBottom: '48px' }}>
              <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Total Brands
                </p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                  {brands.length.toLocaleString()}
                </p>
              </div>
              <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  With Image
                </p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                  {brandsWithImage.toLocaleString()}
                </p>
              </div>
              <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Without Image
                </p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#9f403d' }}>
                  {brandsWithoutImage.toLocaleString()}
                </p>
              </div>
              <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px', borderLeft: '4px solid #565e74' }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Described Brands
                </p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                  {describedBrands.toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 3fr 4fr 2fr 1.5fr 2fr',
                  background: '#e8eff3',
                  padding: '16px 24px',
                  columnGap: '12px',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Code</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Brand Title</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Description</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Preview</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'center' }}>Status</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'center' }}>Actions</div>
              </div>

              {loading ? (
                <div style={{ padding: '40px 24px', color: '#566166', fontSize: '14px' }}>Checking brands...</div>
              ) : (
                <div>
                  {filteredBrands.length === 0 ? (
                    <div style={{ padding: '40px 24px', color: '#566166', fontSize: '14px' }}>No brands found.</div>
                  ) : (
                    filteredBrands.map((brand, index) => {
                      const isStriped = index % 2 === 1;
                      return (
                        <div
                          key={brand._id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 3fr 4fr 2fr 1.5fr 2fr',
                            padding: '20px 24px',
                            alignItems: 'center',
                            borderBottom: '1px solid rgba(169, 180, 185, 0.16)',
                            background: isStriped ? '#f7f9fb' : '#ffffff',
                            columnGap: '12px',
                          }}
                        >
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#2a3439', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            {brand._id.slice(-6)}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#2a3439' }}>{brand.name}</div>
                          <div style={{ fontSize: '13px', color: '#566166', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={brand.description || '—'}>
                            {brand.description || '—'}
                          </div>
                          <div>
                            <div className="brand-image-container">
                              <img
                                src={brand.image || defaultBrandImage}
                                alt={brand.name}
                                className="brand-image"
                              />
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            {(() => {
                              const status = mapBrandStatus(brand);
                              return (
                                <span className={`slate-sales-status-badge ${status.className}`}>
                                  {status.label}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="all-products-actions-cell">
                            <button
                              type="button"
                              className="all-products-action-btn"
                              onClick={() => handleEdit(brand)}
                              aria-label="Edit brand"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                            </button>
                            <button
                              type="button"
                              className="all-products-action-btn all-products-action-btn-delete"
                              onClick={() => handleDelete(brand._id)}
                              aria-label="Delete brand"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>

      {isModalOpen && (
        <div
          className="categories-modal-overlay"
          onClick={() => {
            setIsModalOpen(false);
            setEditingBrand(null);
            setBrandName('');
            setBrandDescription('');
            setBrandImage('');
            setImagePreview('');
          }}
        >
          <div className="categories-modal categories-modal-shell" onClick={(e) => e.stopPropagation()}>
            <div className="categories-modal-topbar">
              <div>
                <span className="categories-modal-badge">{editingBrand ? 'Action: Edit' : 'Action: Create'}</span>
                <h2 className="categories-modal-title-slate">
                  {editingBrand ? 'Edit Brand' : 'Create Brand'}
                </h2>
                <p className="categories-modal-subtitle">
                  ID: <span>{editingBrand?._id ? editingBrand._id.slice(-6) : 'New Brand'}</span>
                </p>
              </div>
              <button
                className="categories-modal-close categories-modal-close-pill"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingBrand(null);
                  setBrandName('');
                  setBrandDescription('');
                  setBrandImage('');
                  setImagePreview('');
                }}
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form id="brandForm" className="categories-modal-form categories-modal-form-slate" onSubmit={handleSubmit}>
              <div className="brand-image-upload-container">
                <div
                  className="brand-image-preview"
                  onClick={handleImageClick}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Brand Preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span className="material-symbols-outlined">upload</span>
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

              <div className="categories-modal-field-row">
                <label className="categories-modal-label">
                  <span className="categories-modal-label-text">Brand Name</span>
                  <input
                    type="text"
                    placeholder="Enter brand name"
                    className="categories-modal-input"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    required
                  />
                </label>

                <label className="categories-modal-label">
                  <span className="categories-modal-label-text">Display Status</span>
                  <select className="categories-modal-input" value={imagePreview ? 'ready' : 'basic'} disabled>
                    <option value="ready">Ready</option>
                    <option value="basic">Basic</option>
                  </select>
                </label>
              </div>

              <label className="categories-modal-label">
                <span className="categories-modal-label-text">Description</span>
                <textarea
                  placeholder="Enter brand description"
                  className="categories-modal-description"
                  value={brandDescription}
                  onChange={(e) => setBrandDescription(e.target.value)}
                  required
                />
              </label>
            </form>

            <div className="categories-modal-footer">
              <button
                type="button"
                className="categories-modal-cancel"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingBrand(null);
                  setBrandName('');
                  setBrandDescription('');
                  setBrandImage('');
                  setImagePreview('');
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#566166',
                  padding: '14px',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  borderRadius: 0,
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  outline: 'none',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#9f403d'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#566166'; }}
              >
                Cancel
              </button>
              <button type="submit" form="brandForm" className="categories-modal-submit">
                {editingBrand ? 'Save Changes' : 'Create Brand'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Brands;

