// import React from 'react';
// import { Filter, FileText, FileSpreadsheet, Plus } from 'lucide-react';

// const PurchaseButtons = ({ onExport, onCreatePurchase, activeFilterCount = 0, toggleFilter }) => {
//   return (
//     <div className="action-buttons">
//       <button 
//         className={`filter-btn ${activeFilterCount > 0 ? 'active' : ''}`} 
//         onClick={toggleFilter}
//       >
//         <Filter size={16} />
//         <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
//       </button>
      
//       <button 
//         className="pdf-btn"
//         onClick={() => onExport('pdf')}
//       >
//         <FileText size={16} />
//         <span>PDF</span>
//       </button>
      
//       <button 
//         className="excel-btn"
//         onClick={() => onExport('csv')}
//       >
//         <FileSpreadsheet size={16} />
//         <span>Excel</span>
//       </button>
      
//       <button 
//         className="create-btn"
//         onClick={onCreatePurchase}
//       >
//         <Plus size={16} />
//         <span>Create New Purchase</span>
//       </button>
//     </div>
//   );
// };

// export default PurchaseButtons;


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
        onClick={onExportPDF}  // Use onExportPDF directly
      >
        <FileText size={16} />
        <span>PDF</span>
      </button>
      
      <button 
        className="excel-btn"
        onClick={onExportExcel}  // Use onExportExcel directly
      >
        <FileSpreadsheet size={16} />
        <span>Excel</span>
      </button>
      
      {/* <button 
        className="create-btn"
        onClick={onCreatePurchase}
      >
        <Plus size={16} />
        <span>Create New Purchase</span>
      </button> */}
    </div>
  );
};

export default PurchaseButtons;
