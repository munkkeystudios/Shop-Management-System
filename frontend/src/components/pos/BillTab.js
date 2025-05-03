import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
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

//  forwardRef to accept refs from parent component
const BillTab = forwardRef(({ billNumber, onTabChange, onTabClose }, ref) => {
  const [billTabs, setBillTabs] = useState([billNumber]);
  const [activeTab, setActiveTab] = useState(`#${billNumber}`);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    handleTabClose: (billNum) => {
      closeTab(null, billNum);
    },
    
    updateAllBillNumbers: (nextBillNumber) => {
      
      
      // If we have multiple tabs, we should keep them
      // but update their bill numbers
      if (billTabs.length > 0) {
        const updatedTabs = [nextBillNumber];
        
        for (let i = 1; i < billTabs.length; i++) {
          updatedTabs.push(nextBillNumber + i);
        }
        
        setBillTabs(updatedTabs);
        
        setActiveTab(`#${nextBillNumber}`);
        
        if (onTabChange) {
          onTabChange(nextBillNumber);
        }
      }
    }
  }));

  // Effect to handle when billNumber changes externally (like after a sale is made)
  useEffect(() => {
    if (!billTabs.includes(billNumber)) {
      setBillTabs(prevTabs => [...prevTabs, billNumber]);
    }
    
    setActiveTab(`#${billNumber}`);
    
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

  const closeTab = (event, billNum) => {
    if (event) {
      event.stopPropagation();
    }
    
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

  // UI event handler for tab close button
  const handleTabClose = (event, billNum) => {
    closeTab(event, billNum);
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
});

export default BillTab;
