
import React from 'react';
import { Filter, FileText, FileSpreadsheet, Plus } from 'lucide-react';

const PurchaseButtons = ({ onExportPDF, onExportExcel, onCreatePurchase, activeFilterCount = 0, toggleFilter }) => {
  return (
    <div className="action-buttons">
      <button 
        className={`filter-btn ${activeFilterCount > 0 ? 'active' : ''}`} 
        onClick={toggleFilter}
      >
        <Filter size={16} />
        <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
      </button>
      
      <button 
        className="pdf-btn"
        onClick={onExportPDF}  
      >
        <FileText size={16} />
        <span>PDF</span>
      </button>
      
      <button 
        className="excel-btn"
        onClick={onExportExcel}  
      >
        <FileSpreadsheet size={16} />
        <span>Excel</span>
      </button>
      
    
    </div>
  );
};

export default PurchaseButtons;
