import React, { useState, useEffect} from "react";
import { FiX } from 'react-icons/fi';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addNotification } = useNotifications();


  // Sample data - replace with your actual data source
// Fetch suppliers from the backend
useEffect(() => {
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
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
        setError(data.message || 'Failed to fetch suppliers');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError('Failed to fetch suppliers');
    } finally {
      setLoading(false);
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

  const totalSuppliers = suppliers.length;
  const withPhoneCount = suppliers.filter((supplier) => supplier.phone && String(supplier.phone).trim()).length;
  const withAddressCount = suppliers.filter((supplier) => supplier.address && String(supplier.address).trim()).length;
  const filteredCount = filteredSuppliers.length;

  return (
    <Layout title="Suppliers">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div style={{ backgroundColor: '#f7f9fb', minHeight: 'calc(100vh - 80px)', fontFamily: 'Manrope, sans-serif' }}>
        <main style={{ flex: 1, minHeight: '100vh', background: '#f7f9fb' }}>
          {loading && !isModalOpen ? (
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
                    Vendor Registry
                  </p>
                  <h2 style={{ margin: 0, fontSize: '36px', fontWeight: 700, letterSpacing: '-0.025em', color: '#2a3439' }}>
                    All Suppliers
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
                      placeholder="Search supplier name..."
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
                      setIsEditMode(false);
                      setEditingSupplierId(null);
                      setSupplierName('');
                      setContactNumber('');
                      setAddress('');
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
                    Create New Supplier
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '24px', marginBottom: '48px' }}>
                <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Total Suppliers
                  </p>
                  <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                    {totalSuppliers.toLocaleString()}
                  </p>
                </div>
                <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    With Contact
                  </p>
                  <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                    {withPhoneCount}
                  </p>
                </div>
                <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    With Address
                  </p>
                  <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                    {withAddressCount}
                  </p>
                </div>
                <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px', borderLeft: '4px solid #565e74' }}>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Search Results
                  </p>
                  <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                    {filteredCount}
                  </p>
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 2fr 3fr 1.5fr',
                    background: '#e8eff3',
                    padding: '16px 24px',
                    columnGap: '12px',
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Supplier</div>
                  <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Contact</div>
                  <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Location</div>
                  <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'center' }}>Actions</div>
                </div>

                {filteredSuppliers.length > 0 ? (
                  <div>
                    {filteredSuppliers.map((supplier, index) => {
                      const isStriped = index % 2 === 1;
                      return (
                        <div
                          key={supplier._id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2.5fr 2fr 3fr 1.5fr',
                            padding: '20px 24px',
                            alignItems: 'center',
                            columnGap: '12px',
                            background: isStriped ? 'rgba(240, 244, 247, 0.3)' : 'transparent',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, color: '#2a3439' }}>{supplier.name}</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#566166', marginTop: '2px' }}>
                              {supplier._id?.substring(0, 12) || 'N/A'}
                            </div>
                          </div>
                          <div style={{ color: '#566166', fontSize: '14px' }}>{supplier.phone || '-'}</div>
                          <div style={{ color: '#566166', fontSize: '14px' }}>{supplier.address || '-'}</div>
                          <div className="action-icons" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button
                              className="supplier-action-icon-btn"
                              title="Edit"
                              onClick={() => handleEdit(supplier)}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                            </button>
                            <button
                              className="supplier-action-icon-btn delete"
                              title="Delete"
                              onClick={() => handleDelete(supplier._id)}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '40px 24px', color: '#566166', fontSize: '14px' }}>
                    No suppliers found.
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="supplier-modal-overlay">
          <div className={`supplier-modal ${isEditMode ? 'edit' : 'create'}`}>
            <div className="supplier-modal-header">
              <div>
                <span className="supplier-modal-badge">{isEditMode ? 'Action: Edit' : 'Action: Create'}</span>
                <h2 className="supplier-modal-title">{isEditMode ? 'Edit Supplier' : 'Add Supplier'}</h2>
                <p className="supplier-modal-subtitle">
                  {isEditMode ? (
                    <>ID: <span>{editingSupplierId?.substring(0, 10) || 'N/A'}</span></>
                  ) : (
                    <>Prepare supplier registry entry</>
                  )}
                </p>
              </div>
              <button
                type="button"
                className="supplier-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <form id="supplierModalForm" className="supplier-modal-form" onSubmit={handleSubmit}>
              <div className="supplier-modal-form-grid">
                <div className="supplier-modal-field">
                  <label className="supplier-modal-label">Supplier Name</label>
                  <input
                    type="text"
                    placeholder="Supplier Name"
                    className="supplier-modal-input"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    required
                  />
                </div>

                <div className="supplier-modal-field">
                  <label className="supplier-modal-label">Contact Number</label>
                  <input
                    type="text"
                    placeholder="Contact Number"
                    className="supplier-modal-input"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="supplier-modal-field supplier-modal-field-full">
                  <label className="supplier-modal-label">Address</label>
                  <input
                    type="text"
                    placeholder="Address"
                    className="supplier-modal-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>
            </form>

            <div className="supplier-modal-footer">
              <button
                type="button"
                className="supplier-modal-cancel"
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
              <button type="submit" form="supplierModalForm" className="supplier-modal-submit">
                {isEditMode ? 'Save Changes' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
