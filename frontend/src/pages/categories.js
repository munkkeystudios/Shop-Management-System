import React, { useState, useEffect } from "react";
import { FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import { FiEdit, FiTrash } from 'react-icons/fi';
import Layout from '../components/Layout';
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
  const { addNotification } = useNotifications();

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
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
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
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

  return (
    <Layout title="Categories">
      <div className="categories-frame">
        <div className="categories-div-2">
          <div className="categories-div-3">
            <div className="categories-div-4">
              <div className="categories-text-2">Category</div>
            </div>
            <div className="categories-search-container">
              <FaSearch className="categories-search-icon" />
              <input
                type="text"
                placeholder="Search this table"
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
                      <th>Category Name</th>
                      <th>Category Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr key={category._id}>
                        <td>{category.name}</td> {/* Displaying the category name */}
                        <td>{category.description}</td> {/* Displaying the category description */}
                        <td>
                          <div className="action-icons">
                            <FiEdit
                              className="edit-icon"
                              title="Edit"
                              onClick={() => handleEdit(category)}
                            />
                            <FiTrash
                              className="delete-icon"
                              title="Delete"
                              onClick={() => handleDelete(category._id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="categories-pagination-container">
                  <div className="categories-pagination-controls">
                    <button className="categories-pagination-button">Previous</button>
                    <button className="categories-pagination-button">Next</button>
                  </div>
                  <span className="categories-page-info">Page 1 of 10</span>
                </div>

                <div className="categories-action-buttons-container">
                  <button
                    className="categories-action-button primary"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <FaPlus /> Create New Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="categories-modal-overlay">
          <div className="categories-modal">
            <button
              className="categories-modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              <FaTimes />
            </button>
            <h2 className="categories-modal-title">Create Category</h2>
            <form className="categories-modal-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Enter category name"
                className="categories-modal-input"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Enter category description"
                className="categories-modal-input"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                required
              />
              <label className="categories-modal-label">
  Active Status:
  <select
    className="categories-modal-input"
    value={active}
    onChange={(e) => setActive(e.target.value === 'true')}
  >
    <option value="true">Active</option>
    <option value="false">Inactive</option>
  </select>
</label>
              <button type="submit" className="categories-modal-submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CategoryPage;
