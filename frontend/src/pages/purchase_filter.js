// import React, { useState, useEffect, useRef } from 'react';
// import { X } from 'lucide-react';
// import axios from 'axios';

// const PurchaseFilter = ({ isOpen, onClose, onApplyFilters }) => {
//   const [suppliers, setSuppliers] = useState([]);
//   const [warehouses, setWarehouses] = useState([]);
//   const [loading, setLoading] = useState(false);
  
//   const [filters, setFilters] = useState({
//     supplier: '',
//     status: '',
//     paymentStatus: '',
//     warehouse: '',
//     startDate: '',
//     endDate: '',
//     minAmount: '',
//     maxAmount: ''
//   });
  
//   const filterRef = useRef(null);
  
//   // Close filter when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (filterRef.current && !filterRef.current.contains(event.target)) {
//         onClose();
//       }
//     };
    
//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }
    
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isOpen, onClose]);
  
//   // Fetch suppliers and warehouses for filter options
//   useEffect(() => {
//     const fetchFilterOptions = async () => {
//       setLoading(true);
//       try {
//         // Fetch suppliers
//         const suppliersResponse = await axios.get('/api/suppliers');
//         if (suppliersResponse.data.success) {
//           setSuppliers(suppliersResponse.data.data);
//         }
        
//         // Fetch warehouses
//         const warehousesResponse = await axios.get('/api/warehouses');
//         if (warehousesResponse.data.success) {
//           setWarehouses(warehousesResponse.data.data);
//         }
//       } catch (error) {
//         console.error('Error fetching filter options:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     if (isOpen) {
//       fetchFilterOptions();
//     }
//   }, [isOpen]);
  
//   // Handle filter input changes
//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters({
//       ...filters,
//       [name]: value
//     });
//   };
  
//   // Apply filters
//   const handleApplyFilters = (e) => {
//     e.preventDefault();
//     onApplyFilters(filters);
//     onClose();
//   };
  
//   // Reset filters
//   const handleResetFilters = () => {
//     setFilters({
//       supplier: '',
//       status: '',
//       paymentStatus: '',
//       warehouse: '',
//       startDate: '',
//       endDate: '',
//       minAmount: '',
//       maxAmount: ''
//     });
//     onApplyFilters({});
//     onClose();
//   };
  
//   if (!isOpen) return null;
  
//   return (
//     <div className="filter-dropdown" ref={filterRef}>
//       <div className="filter-header">
//         <h3>Filter Purchases</h3>
//         <button className="close-btn" onClick={onClose}>
//           <X size={18} />
//         </button>
//       </div>
      
//       <form className="filter-form" onSubmit={handleApplyFilters}>
//         <div className="form-group">
//           <label htmlFor="supplier">Supplier</label>
//           <select 
//             id="supplier" 
//             name="supplier" 
//             value={filters.supplier}
//             onChange={handleFilterChange}
//           >
//             <option value="">All Suppliers</option>
//             {suppliers.map(supplier => (
//               <option key={supplier._id} value={supplier._id}>
//                 {supplier.name}
//               </option>
//             ))}
//           </select>
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="warehouse">Warehouse</label>
//           <select 
//             id="warehouse" 
//             name="warehouse" 
//             value={filters.warehouse}
//             onChange={handleFilterChange}
//           >
//             <option value="">All Warehouses</option>
//             {warehouses.map(warehouse => (
//               <option key={warehouse._id} value={warehouse._id}>
//                 {warehouse.name}
//               </option>
//             ))}
//           </select>
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="status">Status</label>
//           <select 
//             id="status" 
//             name="status" 
//             value={filters.status}
//             onChange={handleFilterChange}
//           >
//             <option value="">All Statuses</option>
//             <option value="received">Received</option>
//             <option value="pending">Pending</option>
//             <option value="ordered">Ordered</option>
//             <option value="cancelled">Cancelled</option>
//           </select>
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="paymentStatus">Payment Status</label>
//           <select 
//             id="paymentStatus" 
//             name="paymentStatus" 
//             value={filters.paymentStatus}
//             onChange={handleFilterChange}
//           >
//             <option value="">All Payment Statuses</option>
//             <option value="paid">Paid</option>
//             <option value="partial">Partial</option>
//             <option value="pending">Unpaid</option>
//           </select>
//         </div>
        
//         <div className="date-range">
//           <div className="form-group">
//             <label htmlFor="startDate">From Date</label>
//             <input 
//               type="date" 
//               id="startDate" 
//               name="startDate" 
//               value={filters.startDate}
//               onChange={handleFilterChange}
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="endDate">To Date</label>
//             <input 
//               type="date" 
//               id="endDate" 
//               name="endDate" 
//               value={filters.endDate}
//               onChange={handleFilterChange}
//             />
//           </div>
//         </div>
        
//         <div className="amount-range">
//           <div className="form-group">
//             <label htmlFor="minAmount">Min Amount</label>
//             <input 
//               type="number" 
//               id="minAmount" 
//               name="minAmount" 
//               value={filters.minAmount}
//               onChange={handleFilterChange}
//               min="0"
//               step="0.01"
//               placeholder="0.00"
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="maxAmount">Max Amount</label>
//             <input 
//               type="number" 
//               id="maxAmount" 
//               name="maxAmount" 
//               value={filters.maxAmount}
//               onChange={handleFilterChange}
//               min="0"
//               step="0.01"
//               placeholder="Max"
//             />
//           </div>
//         </div>
        
//         <div className="filter-actions">
//           <button 
//             type="button" 
//             className="reset-filter"
//             onClick={handleResetFilters}
//           >
//             Reset
//           </button>
//           <button 
//             type="submit" 
//             className="apply-filter"
//             disabled={loading}
//           >
//             Apply Filters
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default PurchaseFilter;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const PurchaseFilter = ({ isOpen, onClose, onApplyFilters }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [filterValues, setFilterValues] = useState({
    supplier: '',
    date: '',
    minAmount: '',
    maxAmount: ''
  });

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get('/api/suppliers');
        if (response.data.success) {
          setSuppliers(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilterValues({
      ...filterValues,
      [name]: value
    });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    onApplyFilters(filterValues);
    onClose();
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      supplier: '',
      date: '',
      minAmount: '',
      maxAmount: ''
    };
    setFilterValues(emptyFilters);
    onApplyFilters(emptyFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="filter-dropdown">
      <div className="filter-header">
        <h3>Filter Purchases</h3>
        <button className="close-filter" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <form className="filter-form" onSubmit={handleApplyFilters}>
        <div className="filter-item">
          <label htmlFor="supplier">Supplier</label>
          <select 
            id="supplier" 
            name="supplier" 
            value={filterValues.supplier}
            onChange={handleInputChange}
          >
            <option value="">All Suppliers</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="date">Date</label>
          <input 
            type="date" 
            id="date" 
            name="date" 
            value={filterValues.date}
            onChange={handleInputChange}
          />
        </div>

        <div className="amount-range">
          <div className="form-group">
            <label htmlFor="minAmount">Min Amount</label>
            <input 
              type="number" 
              id="minAmount" 
              name="minAmount" 
              value={filterValues.minAmount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxAmount">Max Amount</label>
            <input 
              type="number" 
              id="maxAmount" 
              name="maxAmount" 
              value={filterValues.maxAmount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="Max"
            />
          </div>
        </div>

        <div className="filter-actions">
          <button type="button" className="reset-filter" onClick={handleResetFilters}>
            Reset
          </button>
          <button type="submit" className="apply-filter">
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseFilter;
