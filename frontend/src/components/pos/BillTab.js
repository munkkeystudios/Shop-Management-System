import React, { useState } from 'react';
import { Tabs, Tab, Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';

function BillTab({ billNumber, onTabChange, onTabClose }) {
  const [billTabs, setBillTabs] = useState([billNumber]);
  const [activeTab, setActiveTab] = useState(`#${billNumber}`);

  // Handler for creating a new bill
  const handleCreateNewBill = () => {
    // Get the highest bill number and increment by 1
    const highestBillNumber = Math.max(...billTabs);
    const newBillNumber = highestBillNumber + 1;
    
    // Add the new bill number to our tabs array
    setBillTabs([...billTabs, newBillNumber]);
    
    // Automatically switch to the new tab
    handleTabSelect(`#${newBillNumber}`);
  };

  // Handler for changing tabs
  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
    
    // Extract bill number from the tabKey (remove the # prefix)
    const selectedBillNumber = parseInt(tabKey.substring(1), 10);
    
    // Notify parent component that tab has changed
    if (onTabChange) {
      onTabChange(selectedBillNumber);
    }
  };

  // Handler for closing a tab
  const handleTabClose = (event, billNum) => {
    // Stop the click event from propagating to the tab itself
    event.stopPropagation();
    
    // Filter out the closed tab
    const updatedTabs = billTabs.filter(tab => tab !== billNum);
    
    // Make sure we always have at least one tab
    if (updatedTabs.length === 0) {
      return;
    }
    
    setBillTabs(updatedTabs);
    
    // If the active tab was closed, switch to the last tab in the list
    if (activeTab === `#${billNum}`) {
      const newActiveTab = `#${updatedTabs[updatedTabs.length - 1]}`;
      handleTabSelect(newActiveTab);
    }
    
    // Notify parent component
    if (onTabClose) {
      onTabClose(billNum);
    }
  };

  // Custom tab title with close button
  const renderTabTitle = (billNum) => (
    <div style={{ 
      position: 'relative', 
      paddingRight: '18px',
      display: 'flex',
      alignItems: 'center',
      height: '100%'
    }}>
      <span style={{ fontSize: '13px' }}>{`#${billNum}`}</span>
      <FaTimes 
        onClick={(e) => handleTabClose(e, billNum)}
        style={{
          position: 'absolute',
          right: '4px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'pointer',
          fontSize: '10px',
          opacity: 0.7,
          color: '#555'
        }}
      />
    </div>
  );

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      width: '100%', 
      alignItems: 'center', 
      height: '36px' 
    }}>
      <Tabs 
        activeKey={activeTab} 
        onSelect={handleTabSelect}
        id="bill-tab"
        className="bill-tabs-container"
        style={{
          margin: 0,
          border: 'none',
          flex: 1,
          height: '100%',
          overflow: 'hidden'
        }}
      >
        {billTabs.map(billNum => (
          <Tab 
            key={`#${billNum}`}
            eventKey={`#${billNum}`} 
            title={renderTabTitle(billNum)}
            style={{
              padding: 0,
              fontSize: '13px'
            }}
          />
        ))}
      </Tabs>
      
      <Button
        style={{ 
          backgroundColor: '#00A838', 
          borderColor: '#009a33', 
          fontSize: '13px',
          padding: '4px 10px',
          height: '32px',
          marginLeft: '12px',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={handleCreateNewBill}
      >
        Create New Bill
      </Button>
    </div>
  );
}

// Add some CSS style for better tab appearance 
// This should be added to your component's parent file or in a global CSS file
const BillTabStyle = () => (
  <style>
    {`
      .bill-tabs-container {
        height: 100%;
      }
      
      .bill-tabs-container .nav-tabs {
        border-bottom: none;
        height: 100%;
      }
      
      .bill-tabs-container .nav-item {
        height: 100%;
      }
      
      .bill-tabs-container .nav-link {
        padding: 6px 12px;
        border: 1px solid #dee2e6;
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        height: 100%;
        display: flex;
        align-items: center;
        font-size: 13px;
        margin-right: 2px;
        background-color: #f8f9fa;
      }
      
      .bill-tabs-container .nav-link.active {
        background-color: #fff;
        border-color: #dee2e6;
        color: #00A838;
        font-weight: 500;
      }
      
      .bill-tabs-container .nav-tabs {
        display: flex;
        flex-wrap: nowrap;
        overflow-x: auto;
        scrollbar-width: thin;
      }
      
      .bill-tabs-container .nav-tabs::-webkit-scrollbar {
        height: 4px;
      }
      
      .bill-tabs-container .nav-tabs::-webkit-scrollbar-thumb {
        background-color: #ddd;
        border-radius: 4px;
      }
    `}
  </style>
);

// Export both components
export const CreateBillButton = ({ onClick }) => {
  return (
    <Button
      style={{ 
        backgroundColor: '#00A838', 
        borderColor: '#009a33', 
        fontSize: '13px',
        padding: '4px 10px',
        height: '32px'
      }}
      onClick={onClick}
    >
      Create New Bill
    </Button>
  );
};

// Export the main component with styles
const BillTabWithStyles = (props) => (
  <>
    <BillTabStyle />
    <BillTab {...props} />
  </>
);

export default BillTabWithStyles;
