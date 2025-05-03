import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import '../styles/billTab.css'; // Import the CSS file

export const CreateBillButton = ({ onClick, text }) => {
  return (
    <Button
      className="new-bill-button"
      style={{ 
        backgroundColor: '#00a838', 
        borderColor: '#00a838',
        color: 'white'
      }}
      size="sm"
      onClick={onClick}
    >
      {text || "+ New Bill"}
    </Button>
  );
};

function BillTab({ billNumber, onTabChange, onTabClose }) {
  const [billTabs, setBillTabs] = useState([billNumber]);
  const [activeTab, setActiveTab] = useState(`#${billNumber}`);

  // Effect to handle when billNumber changes externally (like after a sale is made)
  useEffect(() => {
    if (!billTabs.includes(billNumber)) {
      setBillTabs(prevTabs => [...prevTabs, billNumber]);
    }
    
    setActiveTab(`#${billNumber}`);
    
    // Notify parent component about the change
    if (onTabChange) {
      onTabChange(billNumber);
    }
  }, [billNumber]); // Only run when billNumber prop changes

  const handleCreateNewBill = () => {
    const highestBillNumber = Math.max(...billTabs);
    const newBillNumber = highestBillNumber + 1;
    
    setBillTabs([...billTabs, newBillNumber]);
    
    // Automatically switch to the new tab
    handleTabSelect(`#${newBillNumber}`);
  };

  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
    
    // Extract bill number from the tabKey (remove the # prefix)
    const selectedBillNumber = parseInt(tabKey.substring(1), 10);
    
    if (onTabChange) {
      onTabChange(selectedBillNumber);
    }
  };

  const handleTabClose = (event, billNum) => {
    // Stop the click event from propagating to the tab itself
    event.stopPropagation();
    
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
    
    if (onTabClose) {
      onTabClose(billNum);
    }
  };

  // Custom tab title with close button
  const renderTabTitle = (billNum) => (
    <div className="bill-tab-title">
      <span className="bill-tab-number">{`#${billNum}`}</span>
      <FaTimes 
        onClick={(e) => handleTabClose(e, billNum)}
        className="bill-tab-close"
      />
    </div>
  );

  return (
    <div className="bill-tabs-wrapper">
      <Tabs 
        activeKey={activeTab} 
        onSelect={handleTabSelect}
        id="bill-tab"
        className="bill-tabs-container"
      >
        {billTabs.map(billNum => (
          <Tab 
            key={`#${billNum}`}
            eventKey={`#${billNum}`} 
            title={renderTabTitle(billNum)}
            className="bill-tab"
          />
        ))}
      </Tabs>
      
      <CreateBillButton onClick={handleCreateNewBill} text="Create New Bill" />
    </div>
  );
}

export default BillTab;
