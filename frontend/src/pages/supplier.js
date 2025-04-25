import React, { useState, useEffect} from "react";
import { FaEdit, FaTrash, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import Layout from '../components/Layout';
import { useNotifications } from '../context/NotificationContext';
import './supplier.css';

export const Frame = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState(null);
  const { addNotification } = useNotifications();


  // Sample data - replace with your actual data source
// Fetch suppliers from the backend
useEffect(() => {
  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Not logged in → force login
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/suppliers', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      // you might also want:
      // if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setSuppliers(data.data);
      } else {
        console.warn('Suppliers fetch failed:', data.message);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  fetchSuppliers();
}, []); // empty deps → run once on mount

const handleEdit = (supplier) => {
  setSupplierName(supplier.name);
  setContactNumber(supplier.phone);
  setAddress(supplier.address);
  setEditingSupplierId(supplier._id);
  setIsEditMode(true);
  setIsModalOpen(true);
};

const handleDelete = async (id) => {
  const confirm = window.confirm("Are you sure you want to delete this supplier?");
  if (!confirm) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/suppliers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      const supplierName = suppliers.find(s => s._id === id)?.name || 'Unknown';
      setSuppliers(prev => prev.filter(s => s._id !== id));
      addNotification('supplier', `Supplier "${supplierName}" has been deleted`);
    } else {
      alert(data.message || 'Error deleting supplier');
    }
  } catch (error) {
    console.error('Delete supplier error:', error);
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem('token');
    const url = isEditMode ? `/api/suppliers/${editingSupplierId}` : '/api/suppliers';
    const method = isEditMode ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: supplierName,
        phone: contactNumber,
        address
      })
    });

    const data = await response.json();

    if (data.success) {
      if (isEditMode) {
        setSuppliers(prev =>
          prev.map(s => (s._id === editingSupplierId ? data.data : s))
        );
        addNotification('supplier', `Supplier "${supplierName}" has been updated`, editingSupplierId);
      } else {
        setSuppliers(prev => [...prev, data.data]);
        const supplierId = data.data?._id;
        addNotification('supplier', `New supplier "${supplierName}" has been created`, supplierId);
      }
      setIsModalOpen(false);
      setSupplierName('');
      setContactNumber('');
      setAddress('');
      setIsEditMode(false);
      setEditingSupplierId(null);
    } else {
      alert(data.message || 'Error saving supplier');
    }
  } catch (error) {
    console.error('Save supplier error:', error);
  }
};



  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Suppliers">
      <div className="supplier-frame">
        <div className="supplier-div-2">
          <div className="supplier-div-3">
            <div className="supplier-div-4">
              <div className="supplier-text-2">Supplier</div>
              <div className="supplier-search-container">
                <FaSearch className="supplier-search-icon" />
                <input
                  type="text"
                  placeholder="Search this table"
                  className="supplier-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="supplier-div-6">
              <div className="supplier-div-7">
                <table className="supplier-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id}>
                        <td>{supplier._id}</td>
                        <td>{supplier.name}</td>
                        <td>{supplier.phone}</td>
                        <td>{supplier.address}</td>
                        <td>
                          <div className="supplier-action-buttons">
                            <button className="supplier-action-button"
                            onClick={() => handleEdit(supplier)}>
                              <FaEdit />
                            </button>
                            <button className="supplier-action-button"
                            onClick={() => handleDelete(supplier._id)}>
                              <FaTrash />
                            </button>
                    </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="supplier-pagination-container">
                  <div className="supplier-pagination-controls">
                    <button className="supplier-pagination-button">Previous</button>
                    <button className="supplier-pagination-button">Next</button>
                  </div>
                  <span className="supplier-page-info">Page 1 of 10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="supplier-action-buttons-container">
            <button
              className="supplier-action-button primary"
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus /> Add New Supplier
            </button>
                </div>
              </div>
            </div>

      {isModalOpen && (
        <div className="supplier-modal-overlay">
          <div className="supplier-modal">
            <button
              className="supplier-modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              <FaTimes />
            </button>
            <h2 className="supplier-modal-title">Add Supplier</h2>
            <form className="supplier-modal-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Supplier Name"
                className="supplier-modal-input"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Contact Number"
                className="supplier-modal-input"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Address"
                className="supplier-modal-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <button type="submit" className="supplier-modal-submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};
