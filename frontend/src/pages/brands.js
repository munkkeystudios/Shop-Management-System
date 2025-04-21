import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import Layout from '../components/Layout';
import './brands.css';

const Brands = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);

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
      const response = await fetch('http://localhost:5002/api/brands', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBrands(data.data);
      } else {
        setError('Failed to fetch brands: ' + (data.message || 'Unknown error'));
        console.warn('Brands fetch failed:', data.message);
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

      const method = editingBrand ? 'PUT' : 'POST';
      const url = editingBrand
        ? `http://localhost:5002/api/brands/${editingBrand._id}`
        : 'http://localhost:5002/api/brands';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: brandName,
          description: brandDescription
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh brands list
        await fetchBrands();

        // Reset form
        setIsModalOpen(false);
        setBrandName('');
        setBrandDescription('');
        setEditingBrand(null);
      } else {
        setError(data.message || 'Failed to save brand');
      }
    } catch (err) {
      setError('Failed to save brand');
      console.error('Error saving brand:', err);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setBrandDescription(brand.description);
    setIsModalOpen(true);
  };

  const handleDelete = async (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const response = await fetch(`http://localhost:5002/api/brands/${brandId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          await fetchBrands();
        } else {
          setError(data.message || 'Failed to delete brand');
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
                      <th>Brand Name</th>
                      <th>Brand Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="3">Loading...</td>
                      </tr>
                    ) : filteredBrands.map((brand) => (
                      <tr key={brand._id}>
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
              }}
            >
              <FaTimes />
            </button>
            <h2 className="categories-modal-title">
              {editingBrand ? 'Edit Brand' : 'Create Brand'}
            </h2>
            <form className="categories-modal-form" onSubmit={handleSubmit}>
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

