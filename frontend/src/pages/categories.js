import React, { useState, useEffect } from "react";
import { FiX } from 'react-icons/fi';
import Layout from '../components/Layout';
import './sales.css';
import { useNotifications } from '../context/NotificationContext';
import './categories.css';

const CategoryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [active, setActive] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addNotification } = useNotifications();

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }
        const response = await fetch('/api/categories', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          console.warn('Categories fetch failed:', data.message);
          setError(data.message || 'Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this category?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        const categoryName = categories.find(cat => cat._id === id)?.name || 'Unknown';
        setCategories(prev => prev.filter(category => category._id !== id));
        addNotification('category', `Category "${categoryName}" has been deleted`);
      } else {
        alert(data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Something went wrong while deleting category.');
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

      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `/api/categories/${editingId}`
        : '/api/categories';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: categoryName,
          description: categoryDescription,
          active,
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (isEditing) {
          setCategories(prev =>
            prev.map(cat => (cat._id === editingId ? data.data : cat))
          );
          addNotification('category', `Category "${categoryName}" has been updated`, editingId);
        } else {
          setCategories(prev => [...prev, data.data]);
          const categoryId = data.data?._id;
          addNotification('category', `New category "${categoryName}" has been created`, categoryId);
        }

        setIsModalOpen(false);
        setIsEditing(false);
        setEditingId(null);
        setCategoryName('');
        setCategoryDescription('');
        setActive(true);
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Something went wrong.');
    }
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    setEditingId(category._id);
    setCategoryName(category.name);
    setCategoryDescription(category.description);
    setActive(category.active);
    setIsModalOpen(true);
  };


  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category._id.toLowerCase().includes(searchTerm.toLowerCase()) || // Use _id for category code
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mapCategoryStatus = (isActive) => {
    return isActive
      ? { label: 'Active', className: 'completed' }
      : { label: 'Inactive', className: 'unpaid' };
  };

  const activeCategories = categories.filter((category) => category.active).length;
  const inactiveCategories = categories.filter((category) => !category.active).length;
  const describedCategories = categories.filter((category) => (category.description || '').trim().length > 0).length;

  return (
    <Layout title="Categories">
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
                  Categories
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
                    placeholder="Search category code or title..."
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
                  onClick={() => setIsModalOpen(true)}
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
                  Create New Category
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '24px', marginBottom: '48px' }}>
              <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Total Categories
                </p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                  {categories.length.toLocaleString()}
                </p>
              </div>
              <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Active Categories
                </p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                  {activeCategories.toLocaleString()}
                </p>
              </div>
              <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Inactive Categories
                </p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#9f403d' }}>
                  {inactiveCategories}
                </p>
              </div>
              <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px', borderLeft: '4px solid #565e74' }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Described Categories
                </p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                  {describedCategories.toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 3fr 4fr 1.5fr 2fr',
                  background: '#e8eff3',
                  padding: '16px 24px',
                  columnGap: '12px',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Code</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Category Title</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Description</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'center' }}>Status</div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'center' }}>Actions</div>
              </div>

              {loading ? (
                <div style={{ padding: '40px 24px', color: '#566166', fontSize: '14px' }}>Checking categories...</div>
              ) : (
                <div>
                  {filteredCategories.length === 0 ? (
                    <div style={{ padding: '40px 24px', color: '#566166', fontSize: '14px' }}>No categories found.</div>
                  ) : (
                    filteredCategories.map((category, index) => {
                      const isStriped = index % 2 === 1;
                      return (
                        <div
                          key={category._id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 3fr 4fr 1.5fr 2fr',
                            padding: '20px 24px',
                            alignItems: 'center',
                            borderBottom: '1px solid rgba(169, 180, 185, 0.16)',
                            background: isStriped ? '#f7f9fb' : '#ffffff',
                            columnGap: '12px',
                          }}
                        >
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#2a3439', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            {category._id.slice(-6)}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#2a3439' }}>{category.name}</div>
                          <div style={{ fontSize: '13px', color: '#566166', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={category.description || '—'}>
                            {category.description || '—'}
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            {(() => {
                              const status = mapCategoryStatus(category.active);
                              return (
                                <span className={`slate-sales-status-badge ${status.className}`}>
                                  {status.label}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="all-products-actions-cell" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="all-products-action-btn"
                              title="Edit"
                              onClick={() => handleEdit(category)}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                            </button>
                            <button
                              type="button"
                              className="all-products-action-btn all-products-action-btn-delete"
                              title="Delete"
                              onClick={() => handleDelete(category._id)}
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
        <div className="categories-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="categories-modal categories-modal-shell" onClick={(e) => e.stopPropagation()}>
            <div className="categories-modal-topbar">
              <div>
                <span className="categories-modal-badge">{isEditing ? 'Action: Edit' : 'Action: Create'}</span>
                <h2 className="categories-modal-title-slate">{isEditing ? 'Edit Category' : 'Create Category'}</h2>
                <p className="categories-modal-subtitle">
                  ID: <span>{editingId ? editingId.slice(-6) : 'New Category'}</span>
                </p>
              </div>
              <button
                className="categories-modal-close categories-modal-close-pill"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form id="categoryForm" className="categories-modal-form categories-modal-form-slate" onSubmit={handleSubmit}>
              <div className="categories-modal-field-row">
                <label className="categories-modal-label">
                  <span className="categories-modal-label-text">Category Name</span>
                  <input
                    type="text"
                    placeholder="Enter category name"
                    className="categories-modal-input"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  />
                </label>
                <label className="categories-modal-label">
                  <span className="categories-modal-label-text">Active Status</span>
                  <select
                    className="categories-modal-input"
                    value={active}
                    onChange={(e) => setActive(e.target.value === 'true')}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </label>
              </div>

              <label className="categories-modal-label">
                <span className="categories-modal-label-text">Description</span>
                <textarea
                  placeholder="Enter category description"
                  className="categories-modal-input categories-modal-textarea"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  rows={3}
                  required
                />
              </label>
            </form>

            <div className="categories-modal-footer">
              <button
                type="button"
                className="categories-modal-cancel"
                onClick={() => setIsModalOpen(false)}
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
              <button type="submit" form="categoryForm" className="categories-modal-submit">
                {isEditing ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CategoryPage;
